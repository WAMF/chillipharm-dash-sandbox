import nx from '@nx/eslint-plugin';
import unicorn from 'eslint-plugin-unicorn';
import importX from 'eslint-plugin-import-x';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default [
    ...nx.configs['flat/base'],
    ...nx.configs['flat/typescript'],
    ...nx.configs['flat/javascript'],
    {
        ignores: [
            '**/dist',
            '**/vite.config.*.timestamp*',
            '**/vitest.config.*.timestamp*',
            '**/coverage',
            '**/__snapshots__',
            '**/.nx',
            '**/static',
            '**/tmp',
            '**/.next',
            '**/node_modules',
            '**/generated/**',
            '**/.storybook/**',
            'apps/functions/**',
        ],
    },
    unicorn.configs['flat/recommended'],
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        plugins: {
            'import-x': importX,
        },
        rules: {
            '@nx/enforce-module-boundaries': [
                'error',
                {
                    enforceBuildableLibDependency: true,
                    allow: ['@cp/**'],
                    depConstraints: [
                        {
                            sourceTag: '*',
                            onlyDependOnLibsWithTags: ['*'],
                        },
                    ],
                },
            ],
            'unicorn/no-useless-undefined': 'off',
            'unicorn/no-reduce': 'off',
            'unicorn/prefer-query-selector': 'off',
            'unicorn/no-null': 'off',
            'unicorn/prevent-abbreviations': [
                'error',
                {
                    allowList: {
                        getServerSideProps: true,
                        getStaticProps: true,
                        Props: true,
                        props: true,
                        env: true,
                        res: true,
                        req: true,
                        Args: true,
                        params: true,
                        ref: true,
                        Ref: true,
                        e: true,
                        err: true,
                        ctx: true,
                        fn: true,
                        db: true,
                        el: true,
                        src: true,
                        i: true,
                        j: true,
                        Fn: true,
                        str: true,
                        Str: true,
                        val: true,
                        Val: true,
                        ext: true,
                        Def: true,
                        ColumnDef: true,
                        Params: true,
                        PaginationParams: true,
                    },
                    replacements: {
                        env: {
                            environment: false,
                        },
                    },
                },
            ],
            'unicorn/filename-case': 'off',
            'unicorn/prefer-module': 'off',
            'unicorn/prefer-top-level-await': 'off',
            'unicorn/no-process-exit': 'off',
            'unicorn/prefer-number-properties': 'off',
            'unicorn/prefer-node-protocol': 'off',
            'unicorn/prefer-export-from': 'off',
            'unicorn/import-style': 'off',
            'unicorn/prefer-global-this': 'off',
            'unicorn/prefer-string-slice': 'off',
            'unicorn/numeric-separators-style': 'off',
            'unicorn/no-empty-file': 'off',
            'unicorn/no-negated-condition': 'off',
            'unicorn/no-nested-ternary': 'off',
            'unicorn/no-array-for-each': 'off',
            'unicorn/no-array-reduce': 'off',
            'unicorn/prefer-spread': 'off',
            'unicorn/prefer-dom-node-text-content': 'off',
            'unicorn/switch-case-braces': 'off',
            'unicorn/no-array-sort': 'off',
            'unicorn/prefer-string-replace-all': 'off',
            'unicorn/prefer-dom-node-append': 'off',
            'unicorn/prefer-dom-node-remove': 'off',
            'unicorn/consistent-function-scoping': 'off',
            'unicorn/no-lonely-if': 'off',
            'unicorn/no-array-callback-reference': 'off',
            'import-x/order': [
                'error',
                {
                    groups: [
                        ['builtin', 'external'],
                        ['parent', 'internal', 'sibling', 'index'],
                    ],
                    pathGroups: [
                        {
                            pattern: '@*/**',
                            group: 'internal',
                        },
                    ],
                    alphabetize: {
                        order: 'desc',
                    },
                },
            ],
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                project: ['./tsconfig.*.json'],
            },
        },
        rules: {
            '@typescript-eslint/naming-convention': [
                'error',
                {
                    selector: 'interface',
                    format: ['PascalCase'],
                },
            ],
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            'no-duplicate-imports': 'error',
            'no-irregular-whitespace': 'error',
        },
    },
    {
        files: ['**/*.js', '**/*.jsx'],
        rules: {
            'no-duplicate-imports': 'error',
            'no-irregular-whitespace': 'error',
            '@typescript-eslint/no-var-requires': 'off',
        },
    },
    prettierConfig,
];
