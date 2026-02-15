"use client";
import { Label } from "@/components/ui/label";
import type { Option } from "@/components/ui/multi-select";
import MultipleSelector from "@/components/ui/multi-select";
import { useState } from "react";

// Transform the program data into options
const programOptions: Option[] = [
  {
    value: "482",
    label: "BACHELOR OF SCIENCE IN CIVIL ENGINEERING - GEOTECHNICAL ENGINEERING",
  },
  {
    value: "483",
    label: "BACHELOR OF SCIENCE IN CIVIL ENGINEERING - STRUCTURAL ENGINEERING",
  },
  {
    value: "1",
    label: "AGRI-BUSINESS TECHNOLOGY",
  },
  {
    value: "2",
    label: "AGRICULTURAL TECHNOLOGY",
  },
  {
    value: "3",
    label: "ASSOCIATE IN AGRICULTURAL BUSINESS MANAGEMENT",
  },
  {
    value: "4",
    label: "ASSOCIATE IN AGRICULTURAL TECHNOLOGY",
  },
  {
    value: "691",
    label: "ASSOCIATE IN AGRICULTURE",
  },
  {
    value: "5",
    label: "ASSOCIATE IN COMPUTER TECHNOLOGY",
  },
  {
    value: "714",
    label: "ASSOCIATE IN COMPUTER TECHNOLOGY - UI/UX SPECIALIZATION",
  },
  {
    value: "6",
    label: "ASSOCIATE IN HOSPITALITY MANAGEMENT",
  },
  {
    value: "7",
    label: "ASSOCIATE IN HOTEL AND RESTAURANT MANAGEMENT",
  },
  {
    value: "8",
    label: "ASSOCIATE IN INDUSTRIAL TECHNOLOGY - ARCHITECTURAL DRAFTING",
  },
  {
    value: "9",
    label: "ASSOCIATE IN INDUSTRIAL TECHNOLOGY - AUTOMOTIVE TECHNOLOGY",
  },
  {
    value: "10",
    label: "ASSOCIATE IN INDUSTRIAL TECHNOLOGY - CIVIL TECHNOLOGY",
  },
  {
    value: "11",
    label: "ASSOCIATE IN INDUSTRIAL TECHNOLOGY - ELECTRICAL TECHNOLOGY",
  },
  {
    value: "12",
    label: "ASSOCIATE IN INDUSTRIAL TECHNOLOGY - ELECTRONICS TECHNOLOGY",
  },
  {
    value: "13",
    label: "ASSOCIATE IN INDUSTRIAL TECHNOLOGY - MACHINE SHOP TECHNOLOGY",
  },
  {
    value: "14",
    label: "ASSOCIATE IN INDUSTRIAL TECHNOLOGY - WOODWORKING TECHNOLOGY",
  },
  {
    value: "692",
    label: "ASSOCIATE IN INDUSTRIAL TECHNOLOGY",
  },
  {
    value: "15",
    label: "ASSOCIATE IN RADIOLOGIC TECHNOLOGY",
  },
  {
    value: "80",
    label: "BACHELOR OF SCIENCE IN ACCOUNTANCY",
  },
  {
    value: "85",
    label: "BACHELOR OF SCIENCE IN AGRIBUSINESS",
  },
  {
    value: "92",
    label: "BACHELOR OF SCIENCE IN AGRICULTURE",
  },
  {
    value: "113",
    label: "BACHELOR OF SCIENCE IN ARCHITECTURE",
  },
  {
    value: "114",
    label: "BACHELOR OF SCIENCE IN BIOLOGY",
  },
  {
    value: "118",
    label: "BACHELOR OF SCIENCE IN BUSINESS ADMINISTRATION",
  },
  {
    value: "132",
    label: "BACHELOR OF SCIENCE IN CHEMISTRY",
  },
  {
    value: "133",
    label: "BACHELOR OF SCIENCE IN CIVIL ENGINEERING",
  },
  {
    value: "135",
    label: "BACHELOR OF SCIENCE IN COMPUTER ENGINEERING",
  },
  {
    value: "136",
    label: "BACHELOR OF SCIENCE IN COMPUTER SCIENCE",
  },
  {
    value: "137",
    label: "BACHELOR OF SCIENCE IN CRIMINOLOGY",
  },
  {
    value: "632",
    label: "BACHELOR IN ELEMENTARY EDUCATION",
  },
  {
    value: "631",
    label: "BACHELOR IN SECONDARY EDUCATION - SCIENCE",
  },
  {
    value: "634",
    label: "BACHELOR IN SECONDARY EDUCATION - MATHEMATICS",
  },
  {
    value: "635",
    label: "BACHELOR IN SECONDARY EDUCATION - ENGLISH",
  },
  {
    value: "146",
    label: "BACHELOR OF SCIENCE IN ELECTRICAL ENGINEERING",
  },
  {
    value: "147",
    label: "BACHELOR OF SCIENCE IN ELECTRONICS AND COMMUNICATIONS ENGINEERING",
  },
  {
    value: "151",
    label: "BACHELOR OF SCIENCE IN ENTREPRENEURSHIP",
  },
  {
    value: "165",
    label: "BACHELOR OF SCIENCE IN HOSPITALITY MANAGEMENT",
  },
  {
    value: "166",
    label: "BACHELOR OF SCIENCE IN HOTEL AND RESTAURANT MANAGEMENT",
  },
  {
    value: "169",
    label: "BACHELOR OF SCIENCE IN INDUSTRIAL ENGINEERING",
  },
  {
    value: "181",
    label: "BACHELOR OF SCIENCE IN INFORMATION TECHNOLOGY",
  },
  {
    value: "188",
    label: "BACHELOR OF SCIENCE IN MARINE ENGINEERING",
  },
  {
    value: "189",
    label: "BACHELOR OF SCIENCE IN MARINE TRANSPORTATION",
  },
  {
    value: "190",
    label: "BACHELOR OF SCIENCE IN MATHEMATICS",
  },
  {
    value: "191",
    label: "BACHELOR OF SCIENCE IN MECHANICAL ENGINEERING",
  },
  {
    value: "192",
    label: "BACHELOR OF SCIENCE IN MEDICAL TECHNOLOGY",
  },
  {
    value: "193",
    label: "BACHELOR OF SCIENCE IN MIDWIFERY",
  },
  {
    value: "195",
    label: "BACHELOR OF SCIENCE IN NURSING",
  },
  {
    value: "200",
    label: "BACHELOR OF SCIENCE IN PHARMACY",
  },
  {
    value: "201",
    label: "BACHELOR OF SCIENCE IN PHYSICAL THERAPY",
  },
  {
    value: "202",
    label: "BACHELOR OF SCIENCE IN PSYCHOLOGY",
  },
  {
    value: "205",
    label: "BACHELOR OF SCIENCE IN SOCIAL WORK",
  },
  {
    value: "207",
    label: "BACHELOR OF SCIENCE IN TOURISM",
  },
  {
    value: "208",
    label: "BACHELOR OF SCIENCE IN TOURISM MANAGEMENT",
  },
  {
    value: "43",
    label: "BACHELOR OF ARTS IN POLITICAL SCIENCE",
  },
  {
    value: "44",
    label: "BACHELOR OF ARTS IN PSYCHOLOGY",
  },
  {
    value: "28",
    label: "BACHELOR OF ARTS IN ENGLISH",
  },
  {
    value: "324",
    label: "MASTER IN BUSINESS ADMINISTRATION",
  },
  {
    value: "348",
    label: "MASTER OF ARTS IN EDUCATION",
  },
  {
    value: "67",
    label: "BACHELOR OF LAWS",
  },
  {
    value: "530",
    label: "DOCTOR OF MEDICINE",
  },
];

const MultipleSelectDemo = () => {
  const [selectedPrograms, setSelectedPrograms] = useState<Option[]>([]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Label className="text-lg font-semibold mb-2">
          Select Academic Programs
        </Label>
        <MultipleSelector
          commandProps={{
            label: "Select programs",
          }}
          value={selectedPrograms}
          onChange={setSelectedPrograms}
          defaultOptions={programOptions}
          placeholder="Search programs or type to add custom..."
          hidePlaceholderWhenSelected
          creatable
          emptyIndicator={
            <p className="text-center text-sm text-muted-foreground py-6">
              No programs found. Press Enter to add "{selectedPrograms.length > 0 ? 'custom program' : 'your entry'}"
            </p>
          }
          className="w-full"
        />
        <p className="text-muted-foreground text-xs mt-2">
          Selected {selectedPrograms.length} program(s). You can select from the list or type custom programs.
        </p>

        {/* Display selected programs */}
        {selectedPrograms.length > 0 && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2 text-sm">Selected Programs:</h3>
            <ul className="space-y-1">
              {selectedPrograms.map((program) => (
                <li key={program.value} className="text-sm">
                  • {program.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultipleSelectDemo;