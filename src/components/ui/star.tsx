import { useState } from "react";

interface Props {
    classname?: string,
    maxrating?: 5,
    onChange: (rating: number) => void,
}

export default function Star({ classname, maxrating, onChange }: Props) {

    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);

    return (
        <div className="flex flex-col-reverse m-3">
            {[...Array(5)].map((_, index) => {
                const starValue = index + 1;
                return (
                    <button
                        key={index}
                        type="button"
                        className={`text-4xl ${starValue <= (hover || rating) ? "text-[#FFA500]" : "text-gray-300"}`}
                        onClick={() => {
                            setRating(starValue);
                            onChange(rating);
                        }}
                        onMouseEnter={() => setHover(starValue)}
                        onMouseLeave={() => setHover(0)}
                    >
                        <span className="text-4xl " > &#9733; </span> 
                    </button>
                );
            })}
        </div>
    );
};
