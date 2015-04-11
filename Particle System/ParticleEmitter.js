/**
 * Created by NeonYoung on 4/14/14.
 */
function ParticleEmitter(Geometry,position,positionJitter,initialD,initialDJitter,initialAngle,initialV,rate,lifetime,max){//
    this.count=0;
    this.ParBuffer=new Array();
    this.maxParti=max;
    this.Geometry=Geometry;
    this.LT=lifetime;
    this.DoGravity=true;
    this.DoSpring=false;
    this.DoTornado=false;
    this.DoFlock=false;

    this.update=function()
    {
        for(nC=0;nC<rate;nC++)
        {
            if( this.count<this.maxParti)
            {
                positionJitterVec=new Vector3([positionJitter[0]*(Math.random()-0.5),positionJitter[1]*(Math.random()-0.5),positionJitter[2]*(Math.random()-0.5)]);
                initialDJitterVec=new Vector3([initialDJitter[0]*(Math.random()-0.5),initialDJitter[1]*(Math.random()-0.5),initialDJitter[2]*(Math.random()-0.5)]);
                var P = new Particles(this,this.count,this.Geometry,position.addVector(positionJitterVec),
                                       initialD.addVector(initialDJitterVec).multiplyValue(initialV+Math.random()),0.25,0.2,this.LT*Math.random())//tan uses radius
                this.ParBuffer.push(P);
                GeoList.push(P.Geo);
                this.count++;
            }
        }
        for(nC=0;nC<this.ParBuffer.length;nC++)
        {
            var CP=this.ParBuffer[nC];
            if(CP.status=='dead')

            {
                //CP.Geo.IMG.src='Ground.jpg';
                 this.ParBuffer.remove(CP);
                GeoList.remove(CP.Geo);//this additional function is defined in webgl-utils.js
                this.count--;
            }
            if(CP.status=='active'||CP.status=='nonPhy')
                CP.update();
            CP.index=nC;
        }
    }

    //return (this.Parent==null?this.LocalTransform:this.LocalTransform.multiply(this.Parent.GetMvpMatrix()));
}//GeoObject
