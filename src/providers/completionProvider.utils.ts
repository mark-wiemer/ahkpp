export const hasMatchingCompletionItem = (
    completionLabels: string[],
    prefix: string,
): boolean =>
    !prefix ||
    completionLabels.some((label) =>
        label.toLocaleLowerCase().startsWith(prefix.toLocaleLowerCase()),
    );
