/**
 * Created by NeonYoung on 4/22/14.
 */
function Solver(type,S0)
{
    var S1;
    switch (type)
    {
        case 'Euler': S1=Solver_Euler(S0);break;
        case 'Mdpoint': S1=Solver_Midpoint(S0);break;
        case 'RK3': S1=Solver_RK3(S0);break;
        case 'RK4': S1=Solver_RK4(S0);break;
        case 'ImpMdpoint': S1 = Solver_ImpMidPoint(S0);break;
    }
    return S1;
}

function Solver_Euler(S0)//return S1
{
    S0dot=DotFinder(S0);
    S1=new Array();
    for(i=0;i<S0.length;i++)
        S1[i]=S0[i]+deltaTime*S0dot[i];
    return S1;
}
function Solver_Midpoint(S0)//return S1
{
    S0dot=DotFinder(S0);
    S1=new Array();
    for(i=0;i<S0.length;i++)
        S1[i]=S0[i]+0.5*deltaTime*S0dot[i];

    SMdot=DotFinder(S1);
    S1=new Array();
    for(i=0;i<S0.length;i++)
        S1[i]=S0[i]+deltaTime*SMdot[i];
    return S1;
}
function Solver_RK3(S0)//return S1
{
    k1=DotFinder(S0);
    S1=new Array();
    for(i=0;i<S0.length;i++)
        S1[i]=S0[i]+0.5*deltaTime*k1[i];

    k2=DotFinder(S1);
    S2=new Array();
    for(i=0;i<S0.length;i++)
        S2[i]=S0[i]-deltaTime*k1[i]+2*deltaTime*k2[i];
    k3=DotFinder(S2);
    S_Final=new Array();
    for(i=0;i<S0.length;i++)
        S_Final[i]=S0[i]+deltaTime*(1/6)*(k1[i]+4*k2[i]+k3[i]);
    return S_Final;
}

function Solver_RK4(S0)//return S1
{
    k1=DotFinder(S0);
    S1=new Array();
    for(i=0;i<S0.length;i++)
        S1[i]=S0[i]+0.5*deltaTime*k1[i];

    k2=DotFinder(S1);
    S2=new Array();
    for(i=0;i<S0.length;i++)
        S2[i]=S0[i]+0.5*deltaTime*k2[i];
    k3=DotFinder(S2);
    S3=new Array();
    for(i=0;i<S0.length;i++)
        S3[i]=S0[i]+deltaTime*k3[i];
    k4=DotFinder(S3);
    S_Final=new Array();
    for(i=0;i<S0.length;i++)
        S_Final[i]=S0[i]+deltaTime*(1/6)*(k1[i]+2*k2[i]+2*k4[i]+k4[i]);
    return S_Final;
}

function Solver_ImpMidPoint(S0)//return S1
{
    S1=Solver_Midpoint(S0);
    S1dot=DotFinder(S1);
    SM=new Array();
    for(i=0;i<S0.length;i++)
        SM[i]=S1[i]-0.5*deltaTime*S1dot[i];
    SMdot=DotFinder(SM);
    S2=new Array();
    for(i=0;i<S0.length;i++)
        S2[i]=S1[i]-deltaTime*SMdot[i];
    S_Final=new Array();
    for(i=0;i<S0.length;i++)
        S_Final[i]=S1[i]+0.5*deltaTime*(S0[i]-S2[i]);
    return S_Final;
}

function DotFinder(S)
{
    var Sdot=[S[3],S[4],S[5],S[6],S[7],S[8]];
    for(i=6;i< S.length;i++)
    {
        Sdot[i]=0;
    }
    Sdot[9]=S[10];
    return Sdot;
}

function DotFinder2(S)
{
    var Sdot2=[S[6],S[7],S[8]];
    for(i=3;i< S.length;i++)
    {
        Sdot[i]=0;
    }
    return Sdot2;
}