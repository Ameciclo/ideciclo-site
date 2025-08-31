import { useState } from "react";

export const ExplanationSection = ({ sections }) => {
  const [currentSection, setCurrentSection] = useState(0);

  const renderSectionContent = (content: string[]) => (
    <div className="text-justify text-text-grey">
      {content.map((paragraph, index) => (
        <p key={index} className="mb-4">
          {paragraph}
        </p>
      ))}
    </div>
  );

  return (
    <section className="relative w-100">
      <section className="relative z-[1] container mx-auto lg:w-4/6 my-5 md:my-6 rounded p-12 overflow-auto">
        <div className="flex p-6 justify-between items-center mb-4">
          <div className="relative inline-flex items-center justify-center">
            <h1 className="relative inline-flex items-center justify-center px-4 md:px-8 py-2 md:py-4 gap-4 rounded-full bg-ideciclo-blue shadow-lg text-text-grey text-center font-lato text-xl md:text-3xl font-black leading-normal z-[0]">
              {sections[currentSection].title}
            </h1>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 341 80"
              className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-[120%] flex-shrink-0 z-[-1]"
              style={{
                fill: "#EFC345",
                filter: "drop-shadow(0px 6px 8px rgba(0, 0, 0, 0.25))",
              }}
            >
              <path d="M9.80432 49.4967C9.04999 36.8026 11.6236 24.1085 17.1429 12.7404C22.6622 1.37227 30.5294 -8.52273 39.3846 -10.7C56.0949 -15.0545 73.8052 -15.0545 91.5155 -10.7C100.371 -8.52273 108.238 1.37227 113.757 12.7404C119.276 24.1085 121.85 36.8026 121.096 49.4967L117.628 72.7273C116.874 85.4214 111.355 97.085 103.488 106.659C95.6207 116.232 85.7655 122.458 75.4869 122.458H39.3846C29.1061 122.458 19.2509 116.232 11.3837 106.659C3.51651 97.085 -1.00261 85.4214 -1.75674 72.7273L-5.22432 49.4967Z" />
            </svg>
          </div>
          <div className="flex items-center">
            {sections.map((_, index) => (
              <div
                key={index}
                className={`w-5 h-5 rounded-full mx-1 cursor-pointer ${
                  index === currentSection
                    ? "bg-ideciclo-blue"
                    : "bg-ideciclo-yellow"
                }`}
                onClick={() => setCurrentSection(index)}
              />
            ))}
            <button
              className="p-4 rounded-full ml-2 text-lg font-bold leading-none shadow-sm transform scale-y-150 hover:bg-gray-100"
              onClick={() =>
                setCurrentSection((prev) => (prev + 1) % sections.length)
              }
            >
              {">"}
            </button>
          </div>
        </div>
        <div className="relative z-[-2] top-[-50px] text-gray-800 p-12 py-24 mx-auto bg-background-grey shadow-2xl rounded-lg">
          {renderSectionContent(sections[currentSection].content)}
        </div>
      </section>
      <div className="absolute bottom-0 md:top-0 left-0 w-full z-0">
        <div className="flex mx-2 md:mx-12 md:translate-y-full">
          {Array.from({ length: 20 }).map((_, i) => (
            <svg
              key={i}
              xmlns="http://www.w3.org/2000/svg"
              width="68"
              height="268"
              viewBox="0 0 68 268"
              fill="none"
              className="px-2"
            >
              <path
                d="M67.6863 246.015C67.833 250.383 66.2783 254.644 63.3332 257.946C60.388 261.248 56.2693 263.348 51.8002 263.826C39.4054 265.011 28.312 266.055 17.2806 267.2C6.6004 268.324 2.07628 260.152 1.37391 247.24C0.56825 232.642 0.113775 217.983 0.0931153 203.345C-0.0308293 144.898 -0.0308266 86.4448 0.0931231 27.9848C0.0931233 24.6515 0.361678 21.3182 0.692207 18.0652C0.988921 15.0779 2.07236 12.2152 3.83812 9.75323C5.60387 7.29125 7.99237 5.31295 10.7733 4.00907C20.0281 -0.288083 25.6678 -0.569205 44.7558 1.49905C48.8752 1.98753 52.6892 3.86075 55.5375 6.79441C58.3859 9.72807 60.0892 13.5375 60.3527 17.5632C66.3642 91.418 65.8271 166.578 67.6863 246.015Z"
                fill="#69BFAF"
              />
            </svg>
          ))}
        </div>
      </div>
    </section>
  );
};
