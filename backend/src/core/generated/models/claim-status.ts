

export const ClaimStatus = {
    Pending: 'PENDING',
    InReview: 'IN_REVIEW',
    Finished: 'FINISHED'
} as const;
export type ClaimStatus = typeof ClaimStatus[keyof typeof ClaimStatus];

