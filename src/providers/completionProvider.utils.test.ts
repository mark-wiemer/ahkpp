import * as assert from 'assert';
import { suite, test } from 'mocha';
import { hasMatchingCompletionItem } from './completionProvider.utils';

suite('hasMatchingCompletionItem', () => {
    const completionLabels = ['alpha', 'beta'];

    test('matches before a word is started', () => {
        assert.equal(hasMatchingCompletionItem(completionLabels, ''), true);
    });

    test('matches without considering case', () => {
        assert.equal(hasMatchingCompletionItem(completionLabels, 'AL'), true);
    });

    test('does not match a missing prefix', () => {
        assert.equal(
            hasMatchingCompletionItem(completionLabels, 'word'),
            false,
        );
    });
});
