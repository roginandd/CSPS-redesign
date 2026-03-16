/**
 * Response DTO for inactive membership search results.
 * Represents students who do not have an active membership.
 *
 * Contains only basic student identification fields:
 * @field studentId - the student's ID
 * @field fullName  - the student's full name (optional)
 * @field user      - optional user object with firstName and lastName
 */
export interface InactiveMembershipResponse {
  studentId: string;
  fullName?: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}
