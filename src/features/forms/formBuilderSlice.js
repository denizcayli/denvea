import { createSlice } from '@reduxjs/toolkit';

const createDefaultForm = () => ({
  id: '',
  brandId: 'bioderma',
  title: 'Yeni Form',
  status: 'draft',
  theme: {
    primaryColor: '#C41E3A',
    logoUrl: '',
  },
  sections: [
    {
      id: 'section_kisisel',
      title: 'Bölüm 1',
      fields: [],
    },
  ],
});

const initialState = {
  currentForm: createDefaultForm(),
  selectedFieldId: null,
  selectedSectionId: 'section_kisisel',
  loading: false,
  error: null,
};

const formBuilderSlice = createSlice({
  name: 'formBuilder',
  initialState,
  reducers: {
    setCurrentForm: (state, action) => {
      state.currentForm = action.payload || createDefaultForm();
      // Reset selections
      if (state.currentForm.sections.length > 0) {
        state.selectedSectionId = state.currentForm.sections[0].id;
      } else {
        state.selectedSectionId = null;
      }
      state.selectedFieldId = null;
    },
    setSelectedFieldId: (state, action) => {
      state.selectedFieldId = action.payload;
    },
    setSelectedSectionId: (state, action) => {
      state.selectedSectionId = action.payload;
    },
    resetFormBuilder: (state) => {
      state.currentForm = createDefaultForm();
      state.selectedSectionId = 'section_kisisel';
      state.selectedFieldId = null;
    },
    updateFormMeta: (state, action) => {
      const { key, value } = action.payload;
      if (key === 'primaryColor') {
        state.currentForm.theme.primaryColor = value;
      } else {
        state.currentForm[key] = value;
      }
    },
    updateFormTheme: (state, action) => {
      const { key, value } = action.payload;
      if (!state.currentForm.theme) {
        state.currentForm.theme = {};
      }
      state.currentForm.theme[key] = value;
    },
    
    // Section Operations
    addSection: (state) => {
      const newSectionId = `section_${Date.now()}`;
      state.currentForm.sections.push({
        id: newSectionId,
        title: `Bölüm ${state.currentForm.sections.length + 1}`,
        fields: [],
      });
      state.selectedSectionId = newSectionId;
    },
    deleteSection: (state, action) => {
      const sectionIdToDelete = action.payload;
      state.currentForm.sections = state.currentForm.sections.filter(
        (sec) => sec.id !== sectionIdToDelete
      );
      
      // Update selected section if deleted
      if (state.selectedSectionId === sectionIdToDelete) {
        if (state.currentForm.sections.length > 0) {
          state.selectedSectionId = state.currentForm.sections[0].id;
        } else {
          state.selectedSectionId = null;
        }
      }
      
      // Clean selected field if its parent section is deleted
      state.selectedFieldId = null;
    },
    updateSectionTitle: (state, action) => {
      const { sectionId, title } = action.payload;
      const section = state.currentForm.sections.find((sec) => sec.id === sectionId);
      if (section) {
        section.title = title;
      }
    },
    
    // Field Operations
    addField: (state, action) => {
      const { type, defaultProps } = action.payload;
      const targetSectionId = state.selectedSectionId;
      
      if (!targetSectionId) return;
      
      const section = state.currentForm.sections.find((sec) => sec.id === targetSectionId);
      if (section) {
        const newFieldId = `f_${Date.now()}`;
        const newField = {
          id: newFieldId,
          type,
          ...defaultProps,
        };
        section.fields.push(newField);
        state.selectedFieldId = newFieldId;
      }
    },
    deleteField: (state, action) => {
      const fieldIdToDelete = action.payload;
      
      state.currentForm.sections.forEach((section) => {
        section.fields = section.fields.filter((field) => field.id !== fieldIdToDelete);
      });
      
      if (state.selectedFieldId === fieldIdToDelete) {
        state.selectedFieldId = null;
      }
    },
    updateFieldProps: (state, action) => {
      const { fieldId, props } = action.payload;
      
      state.currentForm.sections.forEach((section) => {
        const fieldIndex = section.fields.findIndex((f) => f.id === fieldId);
        if (fieldIndex !== -1) {
          section.fields[fieldIndex] = {
            ...section.fields[fieldIndex],
            ...props,
          };
        }
      });
    },
    reorderFields: (state, action) => {
      const { sectionId, fields } = action.payload;
      const section = state.currentForm.sections.find((sec) => sec.id === sectionId);
      if (section) {
        section.fields = fields;
      }
    },
    addFieldToSection: (state, action) => {
      const { sectionId, type, defaultProps, index } = action.payload;
      const section = state.currentForm.sections.find((sec) => sec.id === sectionId);
      if (section) {
        const newFieldId = `f_${Date.now()}`;
        const newField = {
          id: newFieldId,
          type,
          ...defaultProps,
        };
        if (index !== undefined && index !== null && index !== -1) {
          section.fields.splice(index, 0, newField);
        } else {
          section.fields.push(newField);
        }
        state.selectedSectionId = sectionId;
        state.selectedFieldId = newFieldId;
      }
    },
    moveField: (state, action) => {
      const { activeId, overId, overSectionId } = action.payload;

      let sourceSection = null;
      let activeIndex = -1;
      let draggedField = null;

      state.currentForm.sections.forEach((sec) => {
        const idx = sec.fields.findIndex((f) => f.id === activeId);
        if (idx !== -1) {
          sourceSection = sec;
          activeIndex = idx;
          draggedField = sec.fields[idx];
        }
      });

      if (!draggedField) return;

      let targetSection = null;
      let overIndex = -1;

      if (overSectionId) {
        targetSection = state.currentForm.sections.find((s) => s.id === overSectionId);
      } else {
        state.currentForm.sections.forEach((sec) => {
          const idx = sec.fields.findIndex((f) => f.id === overId);
          if (idx !== -1) {
            targetSection = sec;
            overIndex = idx;
          }
        });
      }

      if (!targetSection) return;

      sourceSection.fields.splice(activeIndex, 1);

      if (overIndex === -1) {
        targetSection.fields.push(draggedField);
      } else {
        targetSection.fields.splice(overIndex, 0, draggedField);
      }

      state.selectedSectionId = targetSection.id;
      state.selectedFieldId = activeId;
    },
    addOption: (state, action) => {
      const { fieldId } = action.payload;
      state.currentForm.sections.forEach((section) => {
        const field = section.fields.find((f) => f.id === fieldId);
        if (field) {
          if (!field.options) {
            field.options = [];
          }
          field.options.push({
            id: `opt_${Date.now()}`,
            label: `Seçenek ${field.options.length + 1}`,
          });
        }
      });
    },
    deleteOption: (state, action) => {
      const { fieldId, optionId } = action.payload;
      state.currentForm.sections.forEach((section) => {
        const field = section.fields.find((f) => f.id === fieldId);
        if (field && field.options) {
          field.options = field.options.filter((opt) => opt.id !== optionId);
        }
      });
    },
    updateOptionLabel: (state, action) => {
      const { fieldId, optionId, label } = action.payload;
      state.currentForm.sections.forEach((section) => {
        const field = section.fields.find((f) => f.id === fieldId);
        if (field && field.options) {
          const option = field.options.find((opt) => opt.id === optionId);
          if (option) {
            option.label = label;
          }
        }
      });
    },
    reorderOptions: (state, action) => {
      const { fieldId, optionId, direction } = action.payload;
      state.currentForm.sections.forEach((section) => {
        const field = section.fields.find((f) => f.id === fieldId);
        if (field && field.options) {
          const index = field.options.findIndex((opt) => opt.id === optionId);
          if (index !== -1) {
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            if (targetIndex >= 0 && targetIndex < field.options.length) {
              const temp = field.options[index];
              field.options[index] = field.options[targetIndex];
              field.options[targetIndex] = temp;
            }
          }
        }
      });
    },
    moveFieldUpDown: (state, action) => {
      const { fieldId, direction } = action.payload;
      state.currentForm.sections.forEach((section) => {
        const idx = section.fields.findIndex((f) => f.id === fieldId);
        if (idx !== -1) {
          const newIdx = direction === 'up' ? idx - 1 : idx + 1;
          if (newIdx >= 0 && newIdx < section.fields.length) {
            const temp = section.fields[idx];
            section.fields[idx] = section.fields[newIdx];
            section.fields[newIdx] = temp;
          }
        }
      });
    },
  },
});

export const {
  setCurrentForm,
  setSelectedFieldId,
  setSelectedSectionId,
  resetFormBuilder,
  updateFormMeta,
  updateFormTheme,
  addSection,
  deleteSection,
  updateSectionTitle,
  addField,
  deleteField,
  updateFieldProps,
  reorderFields,
  addFieldToSection,
  moveField,
  addOption,
  deleteOption,
  updateOptionLabel,
  reorderOptions,
  moveFieldUpDown,
} = formBuilderSlice.actions;

export default formBuilderSlice.reducer;
