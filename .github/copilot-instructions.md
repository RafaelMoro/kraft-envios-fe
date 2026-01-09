# General instructions to write unit tests for this project

For the unit tests, consider the following instructions:

- If the tests fails because of the router like this error "invariant expected app router to be mounted" or if the component uses router from next, take as reference \_\_tests\_\_/home.test.tsx to wrap the component in AppRouterContextProviderMock like shown there. Add the function push as jest.fn()

- If the test fail like this error "No QueryClient set, use QueryClientProvider to set one" because it needs a query provider due tanstack query usage of mutation or query, takes as reference \_\_tests\_\_/home.test.tsx to wrap the component in QueryProviderMock like shown there

- Do not Mock the component to avoid rendering its internals

- Remember to use userEvent for user interactions. Do not use fireEvent.

- Make sure the tests are passing. Iterate until the tests are passing. Apply the changes into the file if needed. To be sure these are passing run the command: pnpm test -- <relative path>

- Do not Mock the component to avoid rendering its internals

- Remember to use userEvent for user interactions. Do not use fireEvent.

- Do not mock next/image

- Do not use jest.mock() to mock internal components from the same project (components from @/features, @/shared, etc.). This approach can cause module resolution errors and makes tests brittle. Instead, test the actual component behavior or use integration testing approaches that test the full component tree.

- Do not use document.querySelector() or document.getElementById() in tests. These methods break the testing library abstraction and make tests brittle. Instead, use testing-library queries like getByRole, getByText, getByLabelText, or add data-testid attributes to components and use getByTestId for elements that are hard to query semantically.

- Do not test CSS classes directly using toHaveClass() unless absolutely necessary for critical functionality. CSS classes are implementation details that can change frequently and make tests brittle. Instead, focus on testing user-visible behavior, accessibility, and component functionality. If you need to verify styling, consider testing the visual outcome or behavior rather than the specific CSS classes applied.

- Do not write tests that assert on styling, visual appearance, or layout properties. Avoid testing CSS properties, colors, fonts, positioning, or any visual styling aspects. These are implementation details that should be handled by visual regression testing or manual testing. Focus tests on functionality, user interactions, accessibility, and component behavior instead of how things look.

- Avoid writing redundant tests with identical expectations. If multiple test scenarios have the same assertions and expected behavior, consolidate them into a single meaningful test or ensure each test validates genuinely different behavior. For example, testing "primary styling" and "alternative styling" separately is unnecessary if both only verify the same text display without testing actual styling differences. Focus on testing distinct behaviors rather than different prop combinations that produce identical outcomes.

- Do not include file extensions in import statements. Always import without extensions (.ts, .tsx, .js, .jsx). For example, use `import { useAddAddress } from '@/shared/hooks/useAddAddress'` instead of `import { useAddAddress } from '@/shared/hooks/useAddAddress.tsx'`. This is the standard TypeScript convention and prevents module resolution issues.

- When mocking hooks with jest.mock(), use relative imports instead of path aliases (@/). For example, use `jest.mock('../../../src/shared/hooks/useAlias')` instead of `jest.mock('@/shared/hooks/useAlias')`. This prevents module resolution issues in the test environment.

- When testing email validation, always include the @ sign in invalid email test values. Use something like 'invalid-email@a' rather than just 'invalid-email'. This ensures the validation logic properly triggers, as many email validators (like Yup's .email()) require the @ sign to be present before checking format validity.

## Mocks

- Do not export them as default, use name exports
