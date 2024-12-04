export type LabelDecorator = (label: string) => string;

export type LabelDecoratorFactory = () => Array<LabelDecorator>;