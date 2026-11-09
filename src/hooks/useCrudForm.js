import { useCallback, useState } from 'react';
import { showApiError, showApiSuccess } from '../lib/apiError';

const hasErrors = (errors) => Object.values(errors).some(Boolean);

/**
 * Estado e ações de um formulário de cadastro/edição.
 *
 * @param initialData   valores do formulário vazio
 * @param validate      (data, isEditMode) => { campo: mensagem|true|false }
 * @param service       objeto com criar(payload) e atualizar(id, payload, itemOriginal)
 * @param loadData      recarrega a listagem depois de salvar
 * @param fieldLabels   rótulos dos campos para o toast de erro de validação
 * @param entityName    usado nas mensagens padrão ("Produto cadastrado com sucesso!")
 * @param successMessage (criado, isEditMode) => string, para mensagens específicas
 */
export default function useCrudForm({
  initialData,
  validate,
  service,
  loadData,
  fieldLabels,
  entityName = 'Registro',
  successMessage,
  onSuccess,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleNew = useCallback((data = initialData) => {
    setShowForm(true);
    setEditMode(false);
    setCurrentItem(null);
    setFormData(data);
    setErrors({});
  }, [initialData]);

  /** Abre a edição de `item` já preenchendo o formulário com `data`. */
  const handleEdit = useCallback((item, data) => {
    setShowForm(true);
    setEditMode(true);
    setCurrentItem(item);
    if (data) setFormData(data);
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditMode(false);
    setCurrentItem(null);
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  /**
   * Valida, envia e recarrega. Retorna o item criado/atualizado,
   * ou undefined quando a validação ou a requisição falham.
   */
  const handleSave = useCallback(async (mapToPayload = (data) => data) => {
    const validationErrors = validate?.(formData, editMode) ?? {};
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return undefined;

    setSaving(true);
    try {
      const payload = mapToPayload(formData);
      const saved = editMode && currentItem
        ? await service.atualizar(currentItem.id, payload, currentItem)
        : await service.criar(payload);

      await loadData?.();
      handleCancel();
      showApiSuccess(
        successMessage?.(saved, editMode)
          ?? `${entityName} ${editMode ? 'atualizado' : 'cadastrado'} com sucesso!`,
      );
      onSuccess?.(saved);
      return saved ?? null;
    } catch (err) {
      const fieldErrors = showApiError(err, fieldLabels);
      if (fieldErrors) setErrors(fieldErrors);
      return undefined;
    } finally {
      setSaving(false);
    }
  }, [formData, editMode, currentItem, service, loadData, handleCancel, onSuccess, successMessage, validate, fieldLabels, entityName]);

  /** Atualiza um campo e limpa o erro dele. */
  const setField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }, []);

  const clearFieldError = useCallback((field) => {
    setErrors((prev) => (prev[field] ? { ...prev, [field]: undefined } : prev));
  }, []);

  return {
    showForm, editMode, currentItem, formData, setFormData, errors, setErrors, saving,
    handleNew, handleEdit, handleCancel, handleSave, setField, clearFieldError,
  };
}
