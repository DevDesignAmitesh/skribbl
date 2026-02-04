interface ButtonProps {
  onClick: () => void;
  label: string;
}

export const GreenButton = ({ label, onClick }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="py-2 text-4xl w-full font-bold bg-green-500 hover:bg-green-600 text-neutral-100 cursor-pointer"
    >
      {label}
    </button>
  );
};

export const BlueButton = ({ label, onClick }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className="py-2 text-xl w-full font-semibold bg-blue-500 hover:bg-blue-600 text-neutral-100 cursor-pointer"
    >
      {label}
    </button>
  );
};
