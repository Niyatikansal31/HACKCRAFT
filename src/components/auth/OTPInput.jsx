import { useRef } from 'react';

function OTPInput({ value, onChange }) {
  const inputsRef = useRef([]);

  const handleChange = (index, inputValue) => {
    const nextValue = inputValue.replace(/\D/g, '').slice(-1);
    const otpArray = Array.from({ length: 6 }, (_, itemIndex) => value[itemIndex] || '');
    otpArray[index] = nextValue;
    onChange(otpArray.join(''));

    if (nextValue && inputsRef.current[index + 1]) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !value[index] && inputsRef.current[index - 1]) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    event.preventDefault();
    onChange(pasted);
  };

  return (
    <div className="flex justify-center gap-3" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          type="text"
          value={value[index] || ''}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          className="h-14 w-12 rounded-2xl border border-gray-200 text-center text-xl font-semibold focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-900"
          maxLength={1}
        />
      ))}
    </div>
  );
}

export default OTPInput;
