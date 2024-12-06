export type LabelDecorator = (label: string, absoluteFilePath: string) => string;

export type LabelDecoratorFactory = () => Array<LabelDecorator>;

export function combineDecoratorFactories(factories: Array<LabelDecoratorFactory>): LabelDecoratorFactory {
    return () => factories.flatMap(factory => factory());
}