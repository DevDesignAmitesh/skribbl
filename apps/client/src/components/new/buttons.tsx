interface ButtonProps {
  onClick: () => void;
  label: string;
  className?: string;
}

export const GreenButton = ({ label, onClick, className }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`${className} py-2 text-xl w-full font-bold bg-green-500 hover:bg-green-600 text-neutral-100 cursor-pointer h-full`}
    >
      {label}
    </button>
  );
};

export const BlueButton = ({ label, onClick, className }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`${className} py-2 text-xl w-full font-semibold bg-blue-500 hover:bg-blue-600 text-neutral-100 cursor-pointer h-full`}
    >
      {label}
    </button>
  );
};
