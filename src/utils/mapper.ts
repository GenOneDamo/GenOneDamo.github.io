import type {Point, LocationInfo} from './../Types'

export default class Mapper{

    static GetDonutMap(outerRadius : number, maxPoints : number)
    {
        let points = [] as Point[]

        for (var i = outerRadius; i >= 0; i--)
        {
            points = points.concat(Mapper.GetRing(i,maxPoints - points.length,true));
            if (points.length == maxPoints)
            {
                break;
            }
        }
        return points;
    }

    static GetRectangleMap(height : number, maxPoints: number)
    {
        let points = [] as Point[]
  
        for (var i = height; i > 0; i--)
        {
          for (var j = 0; j < Math.ceil(maxPoints/height); j++)
          {
            points.push({
              x: j - Math.ceil(i/2),
               y: i
            })
            if (points.length == maxPoints)
            {
                return points;
            }
          }
        }

        return points;
    }

    static GetHexCutEdgeMap(maxPoints : number)
    {
        let points = [] as Point[]
        let ring = 0;

        while (points.length < maxPoints)
        {
            points = points.concat(Mapper.GetRing(ring++,maxPoints - points.length, false));
        }
        return points;
    }

    static GetHexCutBottomMap(radius: number, maxPoints: number)
    {
        let points = [] as Point[]
  
        for (var i = radius; i >= -radius; i--)
        {
          for (var j = (i > 0 ? -radius : -i-radius); j <= (i > 0 ? radius-i : radius); j++)
          {
            points.push({
              x: j, y: i
            })
            if (points.length == maxPoints)
            {
                return points;
            }
          }
        }

        return points;
    }

    static GetMaxDonutMap(maxPoints: number)
    {
        let radius = 0
        while (radius * (radius + 1) * 3 + 1 < maxPoints)
        {
            radius++;
        }

        return Mapper.GetDonutMap(radius, maxPoints)
    }

    static GetMaxHexCutBottomMap(maxPoints: number)
    {
        let radius = 0
        while (radius * (radius + 1) * 3 + 1 < maxPoints)
        {
            radius++;
        }

        return Mapper.GetHexCutBottomMap(radius, maxPoints)
    }

    static GetLongHexMap(length: number, maxPoints: number)
    {
        let min = length*length + 2 * length - 1

        if (maxPoints < min)
        {
            Mapper.GetMaxHexCutBottomMap(maxPoints)
        }
        
        let width = Math.ceil((maxPoints - min)/(2*length - 1))

        let points = [] as Point[]

        for (let i = length - 1 ; i > - length; i--)
        {

            for (let j = i > 0 ? 0 : -i; i > 0 ? j <= width + length - i + 1 : j <= width + length + 1 ; j++)
            {
              points.push({
                x: j, y: i
              })
              if (points.length == maxPoints)
              {
                  return points;
              }
            }


        }
        
        return points
    }

    static GetRing(radius: number, maxPoint: number, cornerStart: boolean)
    {
        let points = [] as Point[]
     
        if (maxPoint <= 0)
        {
            return points;
        }

        if (radius == 0)
        {
            points.push({x:0,y:0});
            return points;
        }

        for (let i = cornerStart ? 0 : 1; i<=radius ; i++)
        {
            points.push({
                x: - i, 
                y: radius
            })
            if (points.length == maxPoint)
            {
                return points
            }
        }

        for (let i = 1; i<=radius ; i++)
        {
            points.push({
                x: - radius, 
                y: radius -i
            })
            if (points.length == maxPoint)
            {
                return points
            }
        }

        for (let i = 1; i<=radius ; i++)
        {
            points.push({
                x: - radius + i, 
                y: - i
            })
            if (points.length == maxPoint)
            {
                return points
            }
        }

        for (let i = 1; i<=radius ; i++)
        {
            points.push({
                x: i, 
                y: - radius
            })
            if (points.length == maxPoint)
            {
                return points
            }
        }

        for (let i = 1; i<=radius ; i++)
        {
            points.push({
                x: radius, 
                y: i - radius
            })
            if (points.length == maxPoint)
            {
                return points
            }
        }

        for (let i = 1; cornerStart ? i<radius : i<=radius ; i++)
        {
            points.push({
                x: radius - i, 
                y: i
            })
            if (points.length == maxPoint)
            {
                return points
            }
        }


        return points
    }

    static GetLocations(points: Point[], xstart: number, xstop: number, ystart: number, ystop: number)
    {
        let minX = points[0].x + points[0].y / 2.0
        let maxX = minX
        let minY = points[0].y
        let maxY = minY
        
        points.forEach(val => {
          minX = minX > val.x + val.y / 2 ? val.x + val.y / 2 : minX
          maxX = maxX > val.x + val.y / 2 ?  maxX : val.x + val.y / 2
          minY = minY > val.y ? val.y : minY
          maxY = maxY > val.y ?  maxY : val.y
        })
           
        let hexWidth = (xstop-xstart) / ((maxX-minX+1) * Math.sqrt(3))
        let hexHeight = (ystop-ystart) / ((maxY - minY + 1) * 3 / 2.0 + 0.5)
  
        let radius = hexWidth > hexHeight ? hexHeight : hexWidth;

        let locations = [] as LocationInfo[]

        points.forEach(mon => {
            locations.push({
                index: mon,
                coordinates: {
                    x: (xstop+xstart)/2.0 + (mon.x + mon.y/2 - (maxX + minX)/2.0) * Math.sqrt(3) * radius,
                    y: (ystop+ystart)/2.0 - (mon.y - (maxY + minY)/2.0 ) * 3 / 2.0 * radius
                }
            })
        })
          
        return {locations, radius};
    }

}