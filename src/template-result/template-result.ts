export type TemplateResult<T extends Node> = { readonly __INTERNAL__: T };

export const TEMPLATE_RESULT: any = {
  // istanbul ignore next
  get __INTERNAL__() {
    return 'Dummy property used for correct type checking only';
  },
};
