import { FC } from "react";

interface CustomMessageDisplayProps {
  show: boolean;
  title?: string;
  slogan?: string;
  image?: string; // path to image or gif
  imageAlt?: string;
  className?: string;
  titleClassName?: string;
  sloganClassName?: string;
  imageClassName?: string;
}

const CustomMessageDisplay: FC<CustomMessageDisplayProps> = ({
  show,
  title = "No Data Available",
  slogan = "",
  image,
  imageAlt = "Message illustration",
  className = "",
  titleClassName = "",
  sloganClassName = "",
  imageClassName = "",
}) => {
  if (!show) return null;

  return (
    <div className={`w-full flex flex-col items-center justify-center pt-4 ${className}`}>
      {image && (
        <div className={`mb-4 ${imageClassName}`}>
          <img 
            src={image} 
            alt={imageAlt} 
            className="max-w-full h-auto"
          />
        </div>
      )}
      
      {title && (
        <h3 className={`font-medium text-lg text-foreground ${titleClassName}`}>
          {title}
        </h3>
      )}
      
      {slogan && (
        <p className={`text-muted-foreground text-sm mt-2 text-center ${sloganClassName}`}>
          {slogan}
        </p>
      )}
    </div>
  );
};

export default CustomMessageDisplay;

