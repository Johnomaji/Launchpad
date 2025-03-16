const MenuSvg = ({ openNavigation }) => {
  return (
    <svg
      className="overflow-visible"
      width="20"
      height="12"
      viewBox="0 0 20 12"
    >
      {!openNavigation ? (
        <>
          <circle
            className="transition-all origin-center"
            cx={openNavigation ? "5" : "2"}
            cy={openNavigation ? "5" : "0"}
            r="3"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          <circle
            className="transition-all origin-center"
            cx={openNavigation ? "15" : "18"}
            cy={openNavigation ? "5" : "0"}
            r="3"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          <circle
            className="transition-all origin-center"
            cx={openNavigation ? "5" : "2"}
            cy={openNavigation ? "7" : "14"}
            r="3"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
          <circle
            className="transition-all origin-center"
            cx={openNavigation ? "15" : "18"}
            cy={openNavigation ? "7" : "14"}
            r="3"
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
        </>
      ) : (
        <>
          <rect
            className="transition-all origin-center"
            y={openNavigation ? "5" : "0"}
            width="20"
            height="2"
            rx="1"
            fill="white"
            transform={`rotate(${openNavigation ? "45" : "0"})`}
          />
          <rect
            className="transition-all origin-center"
            y={openNavigation ? "5" : "10"}
            width="20"
            height="2"
            rx="1"
            fill="white"
            transform={`rotate(${openNavigation ? "-45" : "0"})`}
          />
        </>
      )}
    </svg>
  );
};

export default MenuSvg;
