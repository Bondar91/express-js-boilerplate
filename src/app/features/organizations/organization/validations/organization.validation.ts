import { celebrate, Joi } from 'celebrate';

const organizationBaseValidation = {
  name: Joi.string().max(255),
  slug: Joi.string()
    .pattern(/^[a-z0-9-]+$/)
    .max(100),
  type: Joi.string().valid('club', 'academy', 'school'),
  address: Joi.string().max(255).allow(null, ''),
  city: Joi.string().max(100).allow(null, ''),
  postalCode: Joi.string().max(20).allow(null, ''),
  country: Joi.string().max(2).allow(null, ''),
  phone: Joi.string().max(20).allow(null, ''),
  email: Joi.string().email().max(100).allow(null, ''),
  website: Joi.string().uri().max(255).allow(null, ''),
  settings: Joi.object().allow(null),
  active: Joi.boolean(),
};

const ownersValidation = {
  owners: Joi.object().keys({
    add: Joi.array().items(Joi.string().uuid()),
    remove: Joi.array().items(Joi.string().uuid()),
  }),
};

export const createOrganizationActionValidation = celebrate(
  {
    body: Joi.object().keys({
      ...organizationBaseValidation,
      name: organizationBaseValidation.name.required(),
      slug: organizationBaseValidation.slug.optional(),
      type: organizationBaseValidation.type.default('club'),
      active: organizationBaseValidation.active.default(true),
    }),
  },
  { abortEarly: false },
);

export const editOrganizationActionValidation = celebrate(
  {
    params: Joi.object().keys({
      publicId: Joi.string().required(),
    }),
    body: Joi.object().keys({
      ...organizationBaseValidation,
      ...ownersValidation,
    }),
  },
  { abortEarly: false },
);

export const listOrganizationsActionValidation = celebrate(
  {
    headers: Joi.object(),
    query: Joi.object().keys({
      page: Joi.string().optional(),
      limit: Joi.string().optional(),
      sort: Joi.string().optional(),
      filter: Joi.string().optional(),
      search: Joi.string().optional(),
    }),
  },
  { abortEarly: false },
);

export const getOrganizationActionValidation = celebrate(
  {
    params: Joi.object().keys({
      publicId: Joi.string().required(),
    }),
  },
  { abortEarly: false },
);
