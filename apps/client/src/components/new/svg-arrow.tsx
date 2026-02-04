interface SvgArrowProps {
  onClick: () => void;
}

export const SvgArrowRight = ({ onClick }: SvgArrowProps) => {
  return (
    <svg
      onClick={onClick}
      width="35"
      height="35"
      viewBox="0 0 118 109"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="cursor-pointer"
    >
      <path
        d="M112.777 48.5109C105.557 51.488 80.9726 63.1302 23.1818 102.911L7.4879 81.0487L71.698 47.9796L6.99271 25.0508L25.2387 4.88871L112.856 46.484C113.682 46.8762 113.623 48.1623 112.777 48.5109Z"
        fill="white"
        stroke="black"
        strokeWidth="12"
      />
    </svg>
  );
};

export const SvgArrowLeft = ({ onClick }: SvgArrowProps) => {
  return (
    <svg
      onClick={onClick}
      width="35"
      height="35"
      viewBox="0 0 118 109"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="cursor-pointer"
    >
      <path
        d="M4.67646 59.1151C11.9224 56.202 36.6092 44.7777 94.7495 5.50977L110.25 27.5098L45.7495 60.0098L110.25 83.5098L91.826 103.51L4.57964 61.1413C3.757 60.7418 3.82796 59.4563 4.67646 59.1151Z"
        fill="white"
        stroke="black"
        strokeWidth="12"
      />
    </svg>
  );
};
