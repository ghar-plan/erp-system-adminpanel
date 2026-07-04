import { FC } from "react";

interface DataNotFoundProps {
  show: boolean;
}

const DataNotFound: FC<DataNotFoundProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="w-full flex justify-center pt-4">
      <span className="font-semibold text-lg text-primaryText italic">No record found</span>
    </div>
  );
};

export default DataNotFound;
