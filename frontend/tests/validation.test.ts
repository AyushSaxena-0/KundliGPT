import { BirthDetails } from "../types";

// Client-side validation helper mock (replicating form validations)
function validateBirthDetails(details: BirthDetails): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (details.name && details.name.trim().length === 0) {
    errors.name = "Name cannot be empty.";
  }
  
  if (details.date_of_birth) {
    const parsedDate = new Date(details.date_of_birth);
    if (isNaN(parsedDate.getTime())) {
      errors.date_of_birth = "Invalid date format.";
    } else if (parsedDate > new Date()) {
      errors.date_of_birth = "Birth date cannot be in the future.";
    }
  }

  if (details.time_of_birth) {
    const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    if (!timeRegex.test(details.time_of_birth)) {
      errors.time_of_birth = "Time must be in HH:MM format.";
    }
  }

  return errors;
}

describe("Client-side Birth Details Validation", () => {
  it("should pass for valid birth details", () => {
    const validDetails: BirthDetails = {
      name: "Amit Patel",
      gender: "Male",
      date_of_birth: "1990-05-15",
      time_of_birth: "14:30",
      place_of_birth: "Mumbai, India",
    };
    const errors = validateBirthDetails(validDetails);
    expect(Object.keys(errors).length).toBe(0);
  });

  it("should catch future birth dates", () => {
    const invalidDetails: BirthDetails = {
      name: "Future Person",
      date_of_birth: "2050-01-01", // Future date
    };
    const errors = validateBirthDetails(invalidDetails);
    expect(errors.date_of_birth).toBe("Birth date cannot be in the future.");
  });

  it("should catch invalid time formats", () => {
    const invalidDetails: BirthDetails = {
      name: "Time Test",
      time_of_birth: "25:00", // Invalid hour
    };
    const errors = validateBirthDetails(invalidDetails);
    expect(errors.time_of_birth).toBe("Time must be in HH:MM format.");
  });

  it("should catch empty/blank names", () => {
    const invalidDetails: BirthDetails = {
      name: "   ", // Blank name
    };
    const errors = validateBirthDetails(invalidDetails);
    expect(errors.name).toBe("Name cannot be empty.");
  });
});
