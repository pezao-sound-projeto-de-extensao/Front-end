import Modal from './ui/Modal';

export default function PhotoViewerModal({ src, alt = 'Foto do produto', onClose }) {
  return (
    <Modal open={Boolean(src)} onClose={onClose} className="max-w-[85vw] w-auto bg-transparent p-0 shadow-none">
      {src && (
        <img src={src} alt={alt} className="max-h-[80vh] max-w-[80vw] rounded-xl object-contain shadow-[0_8px_32px_rgba(0,0,0,0.5)]" />
      )}
    </Modal>
  );
}
