// Flexible status transitions - all valid status changes are allowed
const isValidTransition = (oldStatus, newStatus) => {
    const validStatuses = ['Pending', 'In Progress', 'Blocked', 'Completed'];
    return validStatuses.includes(oldStatus) && validStatuses.includes(newStatus);
};

test('isValidTransition allows all valid status transitions', () => {
    // All transitions between valid statuses should work
    expect(isValidTransition('Pending', 'In Progress')).toBe(true);
    expect(isValidTransition('Pending', 'Completed')).toBe(true);
    expect(isValidTransition('Pending', 'Blocked')).toBe(true);
    expect(isValidTransition('Completed', 'Pending')).toBe(true);
    expect(isValidTransition('Completed', 'In Progress')).toBe(true);
    expect(isValidTransition('Blocked', 'Completed')).toBe(true);

    // Invalid statuses should still fail
    expect(isValidTransition('In Progress', 'Invalid')).toBe(false);
    expect(isValidTransition('Unknown', 'Pending')).toBe(false);
});
