export default class RandomNumbeGenerator{

    a: number;
    b: number;
    c: number;
    d: number;
    seed: string

   constructor (seed: string | null)
    {  
        if (seed == null || seed.length != 40)
        {
            this.a = Math.floor(Math.random() * 4294967296);
            this.b = Math.floor(Math.random() * 4294967296);
            this.c = Math.floor(Math.random() * 4294967296);
            this.d = Math.floor(Math.random() * 4294967296);
            this.seed = RandomNumbeGenerator.CreateSeedString(this.a,this.b,this.c,this.d)
            return;
        }

        this.a = parseInt(seed!.substr(0, 10));
        this.b = parseInt(seed!.substr(10, 10));
        this.c = parseInt(seed!.substr(20, 10));
        this.d = parseInt(seed!.substr(30, 10));
        this.seed = seed;
    }

    static CreateSeedString(a : number, b : number, c : number, d : number) {
        return ('0000000000' + a).slice(-10) + ('0000000000' + b).slice(-10) + ('0000000000' + c).slice(-10) + ('0000000000' + d).slice(-10);
    }

    static NewSeedString()
    {
        return RandomNumbeGenerator.CreateSeedString(Math.floor(Math.random() * 4294967296),Math.floor(Math.random() * 4294967296),Math.floor(Math.random() * 4294967296),Math.floor(Math.random() * 4294967296))
    }

    static CheckSeed(seed: string)
    {
        let pattern = /^(([0-3]\d{9})|(4[0-1]\d{8})|(42[0-8]\d{7})|(429[0-3]\d{6})|(4294[0-8]\d{5})|(42949[0-5]\d{4})|(429496[0-6]\d{3})|(4294967[0-1]\d{2})|(42949672[0-8]\d})|(429496729[0-5])){4}$/
        return seed.match(pattern) != null
    }

    public Generate(m: number)
    {    
        this.a >>>= 0; this.b >>>= 0; this.c >>>= 0; this.d >>>= 0;
        let t = (this.a + this.b) | 0;
        this.a = this.b ^ this.b >>> 9;
        this.b = this.c + (this.c << 3) | 0;
        this.c = (this.c << 21 | this.c >>> 11);
        this.d = this.d + 1 | 0;
        t = t + this.d | 0;
        this.c = this.c + t | 0;
        let r = (t >>> 0);
        return r % m;
    }

    public Shuffle(size: number)
    {
        let array = [];
        for (let i = 0; i < size; i++) {
            array.push(i);
        }
    
        for (let i = size - 1; i > 0; i--)
        {
            let r = this.Generate(i + 1);
            if (i != r)
            {
                [array[i], array[r]] = [array[r], array[i]];
            }
        }

    return array;
    }
}
