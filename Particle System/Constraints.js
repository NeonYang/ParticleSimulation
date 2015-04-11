/**
 * Created by NeonYoung on 4/22/14.
 */

var Constraints=new Array([-0.1,1,0,0.4],[-1,0,0,-4],[1,0,0,-4],[0,0,-1,-4],[0,0,1,-4]);
function DoConstraint(m,pos0,pos1,velo0,velo1)//arrays pos[px,py,pz]
{

    //var constraint1=[-0.1,-1,-0.1,0.55];//line -0.1x-y-0.1z=0.55
    //var constraint1=[0,-1,0,0];//line -y=0.55
    var InitiallPos=new Vector3(pos0);
    var InitalVelo=new Vector3(velo0);
    var finalPos=new Vector3(pos1);
    var finalVelo=new Vector3(velo1);
    var FR,Nns=new Array();
    //collision constraint
    for(NC=0;NC<Constraints.length;NC++)
    {
        /* if(GetValueofLinearFunction(pos0,Constraints[NC])==0&&InitalVelo.magnitude()==0)
         {
         return [InitiallPos,InitalVelo];
         }*/
        Lmda0=GetValueofLinearFunction(pos0,Constraints[NC]);
        Lmda1=GetValueofLinearFunction(pos1,Constraints[NC]);
        if(Lmda0*Lmda1<0)
        {
            //get intersection point
         IntPoint=new Vector3(solveLinearFunc(Constraints[NC],[pos0[1]-pos1[1],pos1[0]-pos0[0],0,pos1[0]*pos0[1]-pos0[0]*pos1[1]],[0,pos0[2]-pos1[2],pos1[1]-pos0[1],pos1[1]*pos0[2]-pos0[1]*pos1[2]]));

         xR=InitiallPos.subtractVector(IntPoint).magnitude()/InitiallPos.subtractVector(finalPos).magnitude();

         pos1=IntPoint.elements;
         velo1=(InitalVelo.multiplyValue(1-xR).addVector(finalVelo.multiplyValue(xR))).elements;


            signNormal=Lmda0/Math.abs(Lmda0)/Math.sqrt(Constraints[NC][0]*Constraints[NC][0]+Constraints[NC][1]*Constraints[NC][1]+Constraints[NC][2]*Constraints[NC][2]);
            Nn=new Vector3([signNormal*Constraints[NC][0],signNormal*Constraints[NC][1],signNormal*Constraints[NC][2]]);
            Nns.push(Nn);
        }
    }
    var AvgN=new Vector3([0,0,0]);
    if(Nns.length>0)
    {
        if(Nns.length>1)
            alert('');
         for(i=0;i<Nns.length;i++)
         {
            AvgN=AvgN.addVector(Nns[i]);
         }
        AvgN=AvgN.multiplyValue(1/Nns.length);
        deltaV = AvgN.multiplyValue(finalVelo.dotProduct(AvgN))
        FR=deltaV.multiplyValue(-1.7*m/deltaTime);
    }else{
        FR=new Vector3([0,0,0]);
    }

    return FR;
}

function GetValueofLinearFunction(PT,coeff)//equivalent to homogeneous coordinate do dot product
{
    return PT[0]*coeff[0]+PT[1]*coeff[1]+PT[2]*coeff[2]-coeff[3];
}
function solveLinearFunc(eq0,eq1,eq2)
{
    //eq: ax+by=cz=d [a b c d]
    d=(eq0[0]*eq1[1]*eq2[2]+eq0[1]*eq1[2]*eq2[0]+eq0[2]*eq1[0]*eq2[1]-eq0[0]*eq1[2]*eq2[1]-eq0[1]*eq1[0]*eq2[2]-eq0[2]*eq1[1]*eq2[0]);
    d1=(eq0[3]*eq1[1]*eq2[2]+eq0[1]*eq1[2]*eq2[3]+eq0[2]*eq1[3]*eq2[1]-eq0[3]*eq1[2]*eq2[1]-eq0[1]*eq1[3]*eq2[2]-eq0[2]*eq1[1]*eq2[3]);
    d2=(eq0[0]*eq1[3]*eq2[2]+eq0[3]*eq1[2]*eq2[0]+eq0[2]*eq1[0]*eq2[3]-eq0[0]*eq1[2]*eq2[3]-eq0[3]*eq1[0]*eq2[2]-eq0[2]*eq1[3]*eq2[0]);
    d3=(eq0[0]*eq1[1]*eq2[3]+eq0[1]*eq1[3]*eq2[0]+eq0[3]*eq1[0]*eq2[1]-eq0[0]*eq1[3]*eq2[1]-eq0[1]*eq1[0]*eq2[3]-eq0[3]*eq1[1]*eq2[0]);
    sl1=d1/d;
    sl2=d2/d;
    sl3=d3/d;
    return [sl1,sl2,sl3];
}