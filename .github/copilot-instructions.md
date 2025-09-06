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

- Use Gherkin cucumber syntax for describing tests. Here is the reference: https://cucumber.io/docs/gherkin/reference

- Do not use jest.mock() to mock internal components from the same project (components from @/features, @/shared, etc.). This approach can cause module resolution errors and makes tests brittle. Instead, test the actual component behavior or use integration testing approaches that test the full component tree.

## Mocks

- Do not export them as default, use name exports
