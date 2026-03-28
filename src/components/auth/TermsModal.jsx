import Modal from '../ui/Modal';

function TermsModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Terms and Conditions" size="max-w-3xl">
      <div className="space-y-4 text-sm leading-7 text-gray-600 dark:text-gray-300">
        <p>AID AI supports telemedicine discovery, communication, and emergency escalation for informational and coordination purposes.</p>
        <p>Users must provide accurate registration details and use the platform responsibly. Emergency guidance does not replace qualified medical care.</p>
        <p>By continuing, you consent to secure storage of your profile data for account access, care coordination, and service improvement.</p>
      </div>
    </Modal>
  );
}

export default TermsModal;
