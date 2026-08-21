import { useState, useCallback } from 'react';
import { showApiSuccess, showApiError } from '../lib/apiError';

export default function useCrudForm({ initialData, validate, service, loadData, onSuccess }) {
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  const handleNew = useCallback(() => {
    setShowForm(true);
    setEditMode(false);
    setCurrentItem(null);
    resetForm();
  }, [resetForm]);

  const handleEdit = useCallback((item) => {
    setShowForm(true);
    setEditMode(true);
    setCurrentItem(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditMode(false);
    setCurrentItem(null);
    resetForm();
  }, [resetForm]);

  const handleSave = useCallback(async (mapToPayload) => {
    const validationErrors = validate?.(formData) || {};
    setErrors(validationErrors);

    if (Object.values(validationErrors).some(v => v)) return;

    setSaving(true);
    try {
      const payload = mapToPayload ? mapToPayload(formData) : formData;
      if (editMode && currentItem) {
        await service.atualizar(currentItem.id, payload);
      } else {
        await service.criar(payload);
      }
      await loadData();
      handleCancel();
      showApiSuccess(editMode ? 'Item atualizado com sucesso!' : 'Item cadastrado com sucesso!');
      onSuccess?.();
    } catch (err) {
      const { fieldErrors } = parseApiError(err);
      if (fieldErrors) {
        setErrors(fieldErrors);
      }
      showApiError(err);
    } finally {
      setSaving(false);
    }
  }, [formData, editMode, currentItem, service, loadData, handleCancel, onSuccess, validate]);

  const handleClearField = useCallback((field) => {
    setErrors(prev => ({ ...prev, [field]: false }));
  }, []);

  return {
    showForm, editMode, currentItem, formData, setFormData, errors, setErrors, saving,
    handleNew, handleEdit, handleCancel, handleSave, handleClearField,
  };
}

function parseApiError(error) {
  const data = error.response?.data;
  if (data?.errors) {
    return { message: data.detail || 'Campos obrigatórios não preenchidos', fieldErrors: data.errors };
  }
  return { message: data?.detail || data?.message || error.message || 'Erro desconhecido', fieldErrors: null };
}
