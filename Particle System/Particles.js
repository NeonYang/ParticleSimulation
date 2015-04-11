/**
 * Created by NeonYoung on 4/14/14.
 */
function Particles(Emitter,index,Geo,position, velocity,mass,size,life)
{
    this.ParticleEmitter=Emitter;
    this.index=index;
    this.position=position;
    this.force=new Vector3([0,0,0]);
    this.mass=mass;
    this.velocity=velocity;
    this.lifetime=life;
    var lifetimer=0;
    this.status='active';
    this.Geo=new GeoSegment(Geo.IMG.src);
    this.Geo.Buffer=Geo.Buffer;
    this.Geo.IndexBuffer=Geo.IndexBuffer;
    this. Geo.Material= Geo.Material;
    this. Geo.Vertices=Geo.Vertices;
    this. Geo.Indices = Geo.Indices;
    this.Geo.LocalTransform=new Matrix4([mass,0.0,0.0,0.0,
        0.0,mass,0.0,0.0,
        0.0,0.0,mass,0.0,
       0,0,0,1]);
    //this.Geo.LocalTransform.setRotate(Math.random()*360,0,1,0);


    this.update=function()
    {
    if(this.lifetime>0)
    {  if(lifetimer<this.lifetime)
        {lifetimer+=deltaTime;}
        else
        {
            this.status='dead';
        }
    }
        //avoid weird appearance
        if(this.mass<=0)this.status='dead';
        if(this.velocity.magnitude()>16)this.status='dead';

        if(this.status=='nonPhy')
        {
            this.position=this.position.addVector(
                new Vector3([(Input.KeyUp-Input.KeyDown)*0.1,(Input.KeyNumPlus-Input.KeyNumMinus)*0.1,-(Input.KeyLeft-Input.KeyRight)*0.1]));

        }
        if(this.status=='active'){
        this.force = UpdateForce(this,this.ParticleEmitter);
        //this.force = UpdateForce(this,this.ParticleEmitter.ParBuffer);//this.force=...
        acc=this.force.multiplyValue(1/this.mass);
        S0=new Array(this.position.elements[0],this.position.elements[1],this.position.elements[2],
                      this.velocity.elements[0],this.velocity.elements[1],this.velocity.elements[2],
                      acc.elements[0], acc.elements[1], acc.elements[2],
                        this.mass,(this.lifetime>0?-this.mass*deltaTime*20/this.lifetime:0));

       // S1=Solver_Euler(S0);
        //S1=Solver_Midpoint(S0);
        //S1=Solver_RK3(S0);
        S1=Solver(SolverType,S0);
        //FFFF
        /*
        if(FFFF!=0)
        this.force.addVector(FFFF)
        acc=
        S1=
         */
        FinalS1=DoConstraint([S0[0],S0[1],S0[2]],[S1[0],S1[1],S1[2]],[S0[3],S0[4],S0[5]],[S1[3],S1[4],S1[5]]);
        this.position=FinalS1[0];
        this.velocity=FinalS1[1].multiplyValue(0.99);
        this.mass=S1[9];
        /*FinalF=DoConstraint(this.mass,[S0[0],S0[1],S0[2]],[S1[0],S1[1],S1[2]],[S0[3],S0[4],S0[5]],[S1[3],S1[4],S1[5]]);
        if(FinalF.magnitude()>0)
        {
            acc=this.force.addVector(FinalF).multiplyValue(1/this.mass);
            S0=new Array(this.position.elements[0],this.position.elements[1],this.position.elements[2],
                this.velocity.elements[0],this.velocity.elements[1],this.velocity.elements[2],
                acc.elements[0], acc.elements[1], acc.elements[2],
                this.mass);
            S1=Solver(SolverType,S0);
        }
        this.position=new Vector3([S1[0],S1[1],S1[2]]);
        this.velocity=new Vector3([S1[3],S1[4],S1[5]]).multiplyValue(0.99);
        this.mass=S1[9];*/

        //update position to Transform

        }

        updateTransform(this);
    }

}


function updateTransform(par){
    par.Geo.LocalTransform.setTranslate(par.position.elements[0],par.position.elements[1],par.position.elements[2]);
    //size=0.1*par.mass;
    par.Geo.LocalTransform.setScale(par.mass,par.mass,par.mass);
}