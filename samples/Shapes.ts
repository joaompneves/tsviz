
export class Shape {
	public draw() {}
	public resize() {}
	public rotate() { }
}

export class Triangle extends Shape {
	public draw() { }
}

export class Rectangle extends Shape {
	public draw() { }
	public get width(): number { return 0; }
	public set width(w: number) { }
	public get height(): number { return 0; }
	public set height(h: number) { }
}

export class Circle extends Shape {
	public draw() { }
	public get radius(): number { return 0; }
	public set radius(r: number) { }
    public static PI: number;
}