import { ref, reactive } from 'vue';

export function useModal() {
  const showModal = ref(false);
  const modalConfig = reactive({
    type: 'success' as 'success' | 'error' | 'confirm',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  function showSuccessModal(title: string, message: string) {
    modalConfig.type = 'success';
    modalConfig.title = title;
    modalConfig.message = message;
    showModal.value = true;
  }

  function showErrorModal(title: string, message: string) {
    modalConfig.type = 'error';
    modalConfig.title = title;
    modalConfig.message = message;
    showModal.value = true;
  }

  function showConfirmModal(title: string, message: string, onConfirm: () => void) {
    modalConfig.type = 'confirm';
    modalConfig.title = title;
    modalConfig.message = message;
    modalConfig.onConfirm = onConfirm;
    showModal.value = true;
  }

  function closeModal() {
    showModal.value = false;
  }

  return {
    showModal,
    modalConfig,
    showSuccessModal,
    showErrorModal,
    showConfirmModal,
    closeModal
  };
}
