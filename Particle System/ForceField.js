/**
 * Created by NeonYoung on 4/14/14.
 */
function UpdateForce(CurPar,Emitter)
{
   var sigmaForce=new Vector3([0,0,0]);

    if(Emitter.DoGravity)
    {
    sigmaForce=sigmaForce.addVector(Gravity(CurPar));
    }

    if(Emitter.DoSpring)
    {
    AffectedbyParticles=[Emitter.ParBuffer[CurPar.index-1],Emitter.ParBuffer[CurPar.index+1]];
    for(Pi=0;Pi<AffectedbyParticles.length;Pi++)
     {
        if(AffectedbyParticles[Pi]!=null)
        {
            springForceDir = CurPar.position.subtractVector(AffectedbyParticles[Pi].position).normalize();
            x0=0.3;
            K=15*CurPar.mass;
            deltaX = x0 - CurPar.position.subtractVector(AffectedbyParticles[Pi].position).magnitude();
            sigmaForce=sigmaForce.addVector(springForceDir.multiplyValue(deltaX*K));
        }
     }
    }
    if(Emitter.DoTornado)
    {
    TornadoCenter=new Vector3([1,CurPar.position.elements[1],0]);
    rVec=TornadoCenter.subtractVector(CurPar.position);
    vTangN=(new Vector3([-rVec.elements[2],0,rVec.elements[0]])).normalize();
    vTang=vTangN.multiplyValue(CurPar.velocity.subtractVector(new Vector3([0,CurPar.velocity.elements[1],0])).dotProduct(vTangN));
    F_centripetal=rVec.normalize().multiplyValue(CurPar.mass*vTang.magnitude()*vTang.magnitude()/rVec.magnitude());
    //sigmaForce=sigmaForce.addVector(F_centripetal).addVector(vTangN.multiplyValue(40*(1/Math.exp(vTang.magnitude())-0.1)));
    sigmaForce=sigmaForce.addVector(F_centripetal).addVector(vTangN.multiplyValue(-CurPar.mass*Math.pow(vTang.magnitude()-5,3)));/////////////////
    //F_add=rVec
    }

    if(Emitter.DoFlock)
    {
        var Force=new Vector3([0,0,0]);
        var Diffe=new Array();
        for(Diffi=0;Diffi<3;Diffi++)
        {
            Diffe[Diffi] = CurPar.position.elements[Diffi]-Emitter.ParBuffer[0].position.elements[Diffi];
        }
        Diff=new Vector3(Diffe);
        dis=Diff.magnitude();
        Force=Force.addVector(Diff.normalize().multiplyValue(-CurPar.mass*(dis<0.5?-1:1)));
        /*X0=0.2;
        for(i=0;i<CurPar.index;i++)
        {
            var Diffe=new Array();
            for(Diffi=0;Diffi<3;Diffi++)
            {
                Diffe[Diffi] = CurPar.position.elements[Diffi]-Emitter.ParBuffer[i].position.elements[Diffi];
            }
            Diff=new Vector3(Diffe);
           // W=1/Math.exp(Diff.magnitude());
            springForceDir =Diff .normalize();
           // x0=0.3;
            K=100*CurPar.mass;
            deltaX =  - Diff.magnitude();
            Force=Force.addVector(springForceDir.multiplyValue(deltaX*K));
        }*/
        sigmaForce=sigmaForce.addVector(Force);
    }

     if(CurPar.index==0)
     {
         sigmaForce=sigmaForce.addVector(new Vector3([(Input.KeyUp-Input.KeyDown)*5*CurPar.mass,0,-(Input.KeyLeft-Input.KeyRight)*5*CurPar.mass]));
     }
    return sigmaForce;
}

function Gravity(CurPar)
{
    var Gravity=new Vector3([0,-1,0]).multiplyValue(4*CurPar.mass);
    return Gravity;
}

