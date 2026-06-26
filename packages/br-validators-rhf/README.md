# @br-validators/react-hook-form

[![npm](https://img.shields.io/npm/v/@br-validators/react-hook-form)](https://www.npmjs.com/package/@br-validators/react-hook-form)
[![MIT](https://img.shields.io/badge/license-MIT-blue)](https://github.com/AlexandreZanata/br-validators/blob/main/LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/AlexandreZanata/br-validators)](https://github.com/AlexandreZanata/br-validators/releases)

[React Hook Form](https://react-hook-form.com/) rules and resolvers that delegate to [`@br-validators/core`](../br-validators) **v1.8.3**.

## Install

```bash
pnpm add @br-validators/react-hook-form @br-validators/core react react-hook-form
```

## Register + validate rule

```tsx
import { useForm } from 'react-hook-form';
import { cpfRule } from '@br-validators/react-hook-form';

const { register } = useForm<{ cpf: string }>();
<input {...register('cpf', cpfRule({ required: 'CPF is required' }))} />;
```

## Resolver

```tsx
import { useForm } from 'react-hook-form';
import { cpfResolver } from '@br-validators/react-hook-form';

const form = useForm<{ cpf: string }>({ resolver: cpfResolver() });
```

Invalid values surface the same `message` string returned by core `validate*`.

## License

MIT
