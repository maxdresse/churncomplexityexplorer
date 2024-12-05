export type LabelDecorator = (label: string, absoluteFilePath: string) => string;

export type LabelDecoratorFactory = () => Array<LabelDecorator>;