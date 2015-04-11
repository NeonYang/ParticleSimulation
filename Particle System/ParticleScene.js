// RotatingTriangle.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec2 a_TexCoord;\n' +
  'attribute vec4 a_VNormal;\n' +
  'uniform mat4  u_NormalMatrix;\n' +
  'attribute vec4 a_Color;\n' +//an entrance for external parameter
  'uniform mat4 u_ModelMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'varying vec2 v_TexCoord;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'uniform mat4 u_MvpMatrix;\n' +

  'void main() {\n' +
  '  gl_Position =  u_MvpMatrix * u_ModelMatrix * a_Position;\n' +
  '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
  '  v_TexCoord = a_TexCoord;\n' +
  '  v_Color = a_Color;\n'+
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_VNormal));\n' +
  '}\n';
// Fragment shader program
var FSHADER_SOURCE =//in shader z is up
  '#ifdef GL_ES\n' +
  'precision highp float;\n' +
  '#endif\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'uniform vec3 u_Eye;\n' +
  'uniform sampler2D u_Sampler;\n' +
  'varying vec2 v_TexCoord;\n' +
  'varying vec4 v_Color;\n' +
  'varying vec3 v_Normal;\n' +//for phong shading
  'varying vec3 v_Position;\n' +//for phong shading
  ' struct light{\n'+
                'vec3 position;\n'+
                'vec3 ambient;\n'+
                'vec3 color;\n'+
                'float intensity;\n'+
                'int type;\n'+
                'vec4 SpotLightDir;\n'+
    '};\n'+
    'struct material{\n'+
      'vec3 K_emit;\n'+
      //'vec3 K_ambi;\n'+
      'vec3 K_diff;\n'+
      'vec3 K_spec;\n'+
      'float shiness;\n'+
      '};\n'+
   'uniform light lights[8];\n'+
   'uniform material Mtl;\n'+
   'void main() {\n' +
       'vec4 PixelColor = texture2D(u_Sampler, v_TexCoord);\n' +
      // Normalize the normal because it is interpolated and not 1.0 in length any more
      '  vec3 normal = normalize(v_Normal);\n' +//--------this sampler must be used to avoid program exception
      '\ for(int i=0;i<8;i++)\n'+
      // Calculate the light direction and make it 1.0 in length
      '{  vec3 lightDirection = normalize(lights[i].position - v_Position);\n' +
      // The dot product of the light direction and the normal
      'float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
      'vec3 E = normalize(u_Eye-v_Position); \n' +
      'vec3 R = normalize (2.0*normal*dot(normal,lightDirection)-lightDirection) ; \n' +//pow(max(0,0),Mtl.shiness);\n' +
      'float spec =  pow(max(0.0,dot(R,E)),150.0) ; \n' +//pow(max(0,0),Mtl.shiness);\n' +
      'float attenuation=1.0;\n'+

      'if(lights[i].type==1)\n'+//point
      'attenuation =lights[i].intensity* inversesqrt(distance(lights[i].position,v_Position)) ;\n'+
      'else if(lights[i].type==2)\n'+//spot light
    // attenuate more, based on spot-relative position
      '{float spotCos = dot(lightDirection,-normalize(lights[i].SpotLightDir.xyz));\n'+//-ConeDirection-------------------------------
      '\if(spotCos\<0.707)\n'+//SpotCosCutoff
      'attenuation = 0.0;\n'+
     'else \n'+
     '{attenuation *= pow(spotCos,1.0/lights[i].intensity);}}\n'+

      // Calculate the final color from diffuse reflection and ambient reflection
      '  vec3 emissive = Mtl.K_emit; \n'+
      '  vec3 diffuse = Mtl.K_diff * attenuation * lights[i].color * PixelColor.rgb * nDotL;\n' +
      '  vec3 ambient = lights[i].ambient * PixelColor.rgb;\n' +
      '  vec3 specular = Mtl.K_spec * attenuation * lights[i].color *  spec ;\n' +
      '  gl_FragColor += vec4((emissive + diffuse + ambient)*1.0  +specular , 1);}\n' +
//'if(gl_FragColor.xyz==vec3(1,1,1))\n'+
//'{discard;}\n'+
  '}\n';
//global Variables for shader
var u_ModelMatrix;
var u_NormalMatrix;
var u_MvpMatrix;
var a_Position;
var a_TexCoord;
var a_VNormal;
var u_Eye;

var u_LightColor;
var u_LightIntensity;
var u_LightAmbient;
var u_LightPosition;
var u_LightType;
var u_LightDirection;

var u_Mtl_diffuse;
var u_Mtl_specular;
var u_Mtl_emissive;
var u_Mtl_shiness;

var texture0;
var textureN;

var normalMatrix = new Matrix4(); // Transformation matrix for normals
//global Variables for Canvas
var canvas = document.getElementById('webgl');
var gl ;//take gl as a global variable so that can be accessed by Initial and Update
var ViewPorts=[[1,0.025,0.025,0.95,0.95],[0,0,0.6875,0.25,0.25],[1,0,0.375,0.25,0.25],[2,0,0.0625,0.25,0.25]];//for viewports now, [CameraIndex,x,y,width,height]
var DrawAxis=false;
var LastT=Date.now();
var deltaTime;
var fpsCt=document.getElementById('fps');
var Solvers = document.getElementById("Solver");
var SolverType='RK4';

function main() {
  // Initialize gl, buffer, shader..
   //VV=new Vector3([0,2,0]);
  // console.log(VV.multiplyValue(3));
   Initial();
    //Update// draw each frame
   Update();//trigger at least once
}



Initial=function (){
    //retrive canvas content
    gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    // gl.globalAlpha=0.5;
    //Set WindowSize
    winResize();
    //Register Event
    //
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }
    // Initialize Buffers, set vertices to buffers
    initGeoBuffers(gl);
    //Initialize Input class
    Input.Init();
    //Prepare to draw
    gl.clearColor(0, 0, 0, 1.0);
    gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
    gl.enable(gl.DEPTH_TEST);

    // Get storage location of u_ModelMatrix, send the Transform matrix to this u_ModelMatrix before drawing an object
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');//set a global variable
    u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    u_Eye=gl.getUniformLocation(gl.program, 'u_Eye');
    a_Position = gl.getAttribLocation(gl.program,'a_Position');
    a_TexCoord = gl.getAttribLocation(gl.program,'a_TexCoord');
    a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    a_VNormal = gl.getAttribLocation(gl.program, 'a_VNormal');

    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }
    //initialize texture, sampler
    if (!initTextures(gl)) {
        console.log('Failed to intialize the texture.');
        return;
    }
};
Update = function() {
    deltaTime=(Date.now()-LastT)/1000;
    LastT=Date.now();
    fpsCt.innerHTML=Math.round(1/deltaTime);
    //Light0 Update

    //Cam1 Auto Update
    var TempInvM = new Matrix4();
    TempInvM.setInverseOf(Cam1.Transform);

    ViewControlLogic();
    draw(gl);   // Draw
    PEmitter1.update();
    AutoAnimationID=requestAnimationFrame(Update, canvas); // Request that the browser calls tick
};


function initGeoBuffers(gl){//called once in the main function
    for(i=0;i<GeoList.length;i++){
    GeoList[i].Buffer=initSingleGeoVertBuffer(gl,GeoList[i].Vertices,8,gl.FLOAT);////////////////length of each point is 8
    GeoList[i].IndexBuffer=initSingleGeoFaceBuffer(gl,GeoList[i].Indices);////////////////
    //more buffers...
    }
   Axis.Buffer=initSingleGeoVertBuffer(gl,Axis.Vertices,5,gl.FLOAT);
}
function initSingleGeoVertBuffer(gl,VertData,num,type) {
  // Create a buffer object
  var GeoVertexBuffer = gl.createBuffer();
  if (!GeoVertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  // Bind the buffer object to target, we can bind many buffers to ARRAY_BUFFER
  gl.bindBuffer(gl.ARRAY_BUFFER, GeoVertexBuffer);
  // Write date into the buffer object
  gl.bufferData(gl.ARRAY_BUFFER, VertData, gl.STATIC_DRAW);
  GeoVertexBuffer.num = num;
  GeoVertexBuffer.type = type;
  return GeoVertexBuffer;
  }
function initSingleGeoFaceBuffer(gl,FaceData) {
    // Create a buffer object
    var FaceBuffer = gl.createBuffer();
    if (!FaceBuffer) {
        console.log('Failed to create the face buffer object');
        return -1;
    }
    // Bind the buffer object to target, we can bind many buffers to ARRAY_BUFFER
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, FaceBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, FaceData, gl.STATIC_DRAW);
    FaceBuffer.num = FaceData.length;
    return FaceBuffer;
}
function initTextures(gl) {
    texture0 = gl.createTexture();   // Create a texture object
    textureN = gl.createTexture();   // Create a texture object
    if (!texture0&&!textureN) {
        console.log('Failed to create the texture object');
        return false;
    }


    var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');

    if (!u_Sampler) {
        console.log('Failed to get the storage location of u_Sampler');
        return false;
    }

    u_Mtl_diffuse = gl.getUniformLocation(gl.program, 'Mtl.K_diff');
    u_Mtl_specular = gl.getUniformLocation(gl.program, 'Mtl.K_spec');
    u_Mtl_emissive= gl.getUniformLocation(gl.program, 'Mtl.K_emit');
    u_Mtl_shiness= gl.getUniformLocation(gl.program, 'Mtl.K_shiness');
    // Register the event handler to be called on loading an image
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis

    gl.uniform1i(u_Sampler, 0);
    return true;
}



function draw(gl) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);//actually no need to clean depth buffer
    for(L=0;L<LightArr.length;L++)
    {//prepare lights
            u_LightColor = gl.getUniformLocation(gl.program, 'lights['+L+'].color');
            u_LightPosition = gl.getUniformLocation(gl.program, 'lights['+L+'].position');
            u_LightIntensity= gl.getUniformLocation(gl.program, 'lights['+L+'].intensity');
            u_LightAmbient= gl.getUniformLocation(gl.program, 'lights['+L+'].ambient');
            u_LightType = gl.getUniformLocation(gl.program, 'lights['+L+'].type');
            u_LightDirection= gl.getUniformLocation(gl.program, 'lights['+L+'].SpotLightDir');
    if(LightArr[L].parent!=null)
    { gl.uniform3fv( u_LightPosition,LightArr[L].parent.Transform.multiplyVector3(LightArr[L].position).elements);
      gl.uniform4fv(u_LightDirection,LightArr[L].parent.Transform.multiplyVector4(LightArr[L].direction).elements);}
    else
    {gl.uniform3fv( u_LightPosition,LightArr[L].position.elements);
     gl.uniform4fv( u_LightDirection,LightArr[L].direction.elements);
    }
    gl.uniform3fv( u_LightAmbient, LightArr[L].ambient.elements);
    gl.uniform3fv(u_LightColor,LightArr[L].color.elements);

    //gl.uniform3f(u_LightColor,Light0.position.elements);//same
    gl.uniform1f( u_LightIntensity, LightArr[L].intensity);
    gl.uniform1i( u_LightType, LightArr[L].type);
    }
    //draw segments
    for(m=0;m<1;m++){
    //alert(ViewPorts[m][2]);
        gl.uniformMatrix4fv(u_MvpMatrix, false, CamList[ViewPorts[m][0]].GetMvpMatrix().elements);
        gl.uniform3fv(u_Eye, CamList[ViewPorts[m][0]].GetWTranslation().elements);
        gl.viewport(canvas.width*ViewPorts[m][1],canvas.height*ViewPorts[m][2],canvas.width*ViewPorts[m][3],canvas.height*ViewPorts[m][4]);
        for(i=0;i<GeoList.length;i++){
            drawSegment(gl,GeoList[i]);////////////
        }
       // gl.strokeRect(0, 0, 0.5, 0.5);
       // Draw Object Axis
       if(DrawAxis){
        for(i=0;i<GeoList.length;i++){
            drawAxis(gl,GeoList[i]);////////////
        }
       }
    }
}
function drawSegment(gl,GeoObj){
    var n=GeoObj.IndexBuffer.num;//GeoObj.Vertices.length/GeoObj.Buffer.num;
    var buffer=GeoObj.Buffer;
    var modelMatrix=GeoObj.LocalTransform;
    var parentObject=GeoObj.Parent;

    var FSIZE=GeoObj.Vertices.BYTES_PER_ELEMENT;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);//////////////////////////////////////bind vertices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, GeoObj.IndexBuffer);////////////////bind faces
    gl.vertexAttribPointer(a_Position, 3, buffer.type, false, buffer.num*FSIZE, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.vertexAttribPointer(a_TexCoord, 2, buffer.type,false,buffer.num*FSIZE,3*FSIZE);
    gl.enableVertexAttribArray(a_TexCoord);
    gl.vertexAttribPointer(a_VNormal, 3, buffer.type,false,buffer.num*FSIZE,5*FSIZE);
    gl.enableVertexAttribArray(a_VNormal);

    // Pass the rotation matrix to the vertex shader
    var TmpMatrix=new Matrix4()
    TmpMatrix.setIdentity();
    if(parentObject!=null)
    {
        TmpMatrix.set(parentObject.Transform);
    }
    TmpMatrix.multiply(modelMatrix);
    GeoObj.Transform.set(TmpMatrix);
    gl.uniformMatrix4fv(u_ModelMatrix, false, TmpMatrix.elements);
    normalMatrix.setInverseOf(TmpMatrix);
    normalMatrix.transpose();
    // Pass the transformation matrix for normals to u_NormalMatrix
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    // Set the texture image and material
    if(GeoObj.IMG.width !=0)
    {   gl.activeTexture(gl.TEXTURE0);
       // Bind the texture object to the target
       gl.bindTexture(gl.TEXTURE_2D, texture0);
       // Set the texture parameters
       gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
       gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, GeoObj.IMG);


    }


    gl.uniform3fv( u_Mtl_diffuse,GeoObj.Material[1].elements);
    gl.uniform3fv( u_Mtl_specular,GeoObj.Material[2].elements);
    gl.uniform3fv( u_Mtl_emissive,GeoObj.Material[0].elements);
    gl.uniform1f( u_Mtl_shiness,GeoObj.Material[3]);

    // Draw
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}
function drawAxis(gl,CurObject){

    gl.bindBuffer(gl.ARRAY_BUFFER, Axis.Buffer);
    var FSIZE=Axis.Vertices.BYTES_PER_ELEMENT;
    //gl.bindBuffer()
    gl.vertexAttribPointer(a_Position, 3, Axis.Buffer.type, false, Axis.Buffer.num*FSIZE, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.vertexAttribPointer(a_TexCoord, 2, Axis.Buffer.type,false,Axis.Buffer.num*FSIZE,3*FSIZE);
    gl.enableVertexAttribArray(a_TexCoord);

    gl.uniform3fv( u_Mtl_emissive,Axis.Material[0].elements);

   var AxisTransform=new Matrix4();
    AxisTransform.set(CurObject.Transform).scale(0.3,0.3,0.3);
    gl.uniformMatrix4fv(u_ModelMatrix, false, AxisTransform.elements);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, Axis.IMG);
    // Draw
    gl.drawArrays(gl.LINES, 0, 6);
    gl.polygonOffset(1.0, 1.0);
}


///Cameras
var CamList=new Array();
{
var Cam1= new Camera("Pers");
    Cam1.Transform.setTranslate (-3,1,4);//
    Cam1.Transform.setLookAt(new Matrix4(),0,1,0);
   // Cam1.Target=Truck_Body;//Logic here needs optimization
    //Cam1.Transform.rotate(-30,1,0,0)
var Cam2= new Camera("Pers");
    Cam2.Transform.translate(7,4,7);
    Cam2.Transform.rotate(45,0,1,0);
    Cam2.Transform.rotate(-30,1,0,0);

var Cam3=new Camera("Pers");
    Cam3.Transform.translate(4,1.4,-3);
    Cam3.Transform.rotate(70,0,1,0)
    Cam3.Transform.rotate(-30,1,0,0)
    Cam3.Transform.setLookAt(new Matrix4(),0,1,0);
// Cam3.Parent=Excavator_body;
//@@ Cam3.Transform.setLookAt(1.0,.8,0.7,  0,0.2,-0,   0,1,0);

CamList.push(Cam1);
CamList.push(Cam2);
CamList.push(Cam3);
}///Cameras
//LightP.parent=Cam1;
///Light List
var LightArr=new Array();
///lights
var Light0=new Light();
Light0.position=new Vector3([-0.3,0.2,0]);
Light0.color=new Vector3([0,1,0])
Light0.intensity=3;
Light0.type=2;//spot light
Light0.direction=new Vector4([-1,-1,0,0]);//spot light
//Light0.parent=Excavator_body;
LightArr.push(Light0);
/*var Light00=new Light();
Light00.position=new Vector3([-0.5,0.4,0]);
Light00.color=new Vector3([1,1,0.5])
Light00.intensity=0.3;
Light00.type=1;//point light
Light00.parent=Excavator_body;//go with vehicle
LightArr.push(Light00);*/
///
var Light1=new Light();
Light1.position=new Vector3([0,0,0]);// 2 1 2
Light1.ambient=new Vector3([0.2,0.2,0.3])
Light1.intensity=3;
Light1.parent=Cam1;
Light1.type=1;
LightArr.push(Light1);
///
///
var PEmitter1=new ParticleEmitter(GeoSphere01,new Vector3([-1,2,0]),[0.1,0.1,0.1],new Vector3([0,0,1]),[0.1,0.1,0.1],30,1,1,0,20);



function ViewControlLogic(){//Used in Update
    //Change Camera Type
    if(PEmitter1.ParBuffer[0]!=null&&Input.KeyN1==1)
    {CamList[ViewPorts[0][0]].Transform.setLookAt(PEmitter1.ParBuffer[0].Geo.LocalTransform,0,1,0);//setLookAt(Transform,up)
       //PEmitter1.ParBuffer[0].Geo.Transform
    }else{
        CamList[ViewPorts[0][0]].Transform.setLookAt(new Matrix4(),0,1,0);
    }
    if(Input.KeyP==1)
    {
        Cam=CamList[ViewPorts[0][0]];
        if(Cam.type=="Pers"){Cam.type="Orth";}/////////////////////////////-----------------------------------
        else{Cam.type="Pers";}
        Input.KeyP=0;
    }
    ////////Draw Axis or not
    if(Input.KeyEnter)
    {
        if(DrawAxis){DrawAxis=false;}/////////////////////////////-----------------------------------
        else{DrawAxis=true;}
        Input.KeyEnter=0;
    }
    //Switch Screen
    /*if(Input.KeyN1==1)
    {
        ViewPorts[0][0]=ViewPorts[1][0];//V[0] is main Viewport, value at V[n][0] represents CamIndex at nth ViewPort

        Input.KeyN1=0;
    }
    if(Input.KeyN2==1)
    {
        ViewPorts[0][0]=ViewPorts[2][0];//V[0] is main Viewport, value at V[n][0] represents CamIndex at nth ViewPort
        //Input.KeyN1=0;
    }
    if(Input.KeyN3==1)
    {
        ViewPorts[0][0]=ViewPorts[3][0];//V[0] is main Viewport, value at V[n][0] represents CamIndex at nth ViewPort
       // Input.KeyN1=0;
    }//*/
    //Control Camera Fov
    if(Input.MouseWheelDelta!=0)
    { CamList[ViewPorts[0][0]].fovT-=0.01*Input.MouseWheelDelta;
        Input.MouseWheelDelta = 0;
    }
   // CamList[ViewPorts[0][0]].Transform.rotate(-Input.MouseDeltaY*0.05,1,0,0);
    //CamList[ViewPorts[0][0]].Transform.rotate(-Input.MouseDeltaX*0.05,CamList[ViewPorts[0][0]].Transform.elements[1],CamList[ViewPorts[0][0]].Transform.elements[5],CamList[ViewPorts[0][0]].Transform.elements[9]);
    var Sensi=0.1;
    CamList[ViewPorts[0][0]].Transform.translate(Sensi*(Input.KeyD-Input.KeyA),0,Sensi*(-Input.KeyW+Input.KeyS));

 }



var AutoAnimationID;

function winResize() {
    canvas.width = innerWidth*0.75;
    canvas.height = innerHeight*0.75;

}
function ChangeMesh(value,Emitter)
{
    var Geo;
    switch (value)
    {
        case 'ball': Geo=GeoSphere01;break;
        case 'cat': Geo=GeoCat;break;
        case 'ghost': Geo=GeoGhost;break;
        default :  Geo=GeoSphere01;break;
    }

    PEmitter1.Geometry=Geo;
    for(i=0;i<PEmitter1.ParBuffer.length;i++){

        PEmitter1.ParBuffer[i].status='dead';
    }
   // alert(value);
}
function ChangeParticleCount(value,Emitter)
{
    V=parseInt(value);
    for(i=V;i<PEmitter1.ParBuffer.length;i++){

        PEmitter1.ParBuffer[i].status='dead';
    }
    PEmitter1.maxParti=V;
}
function ChangeParticleLife(value,Emitter)
{
    V=parseInt(value);
    for(i=0;i<PEmitter1.ParBuffer.length;i++){

        PEmitter1.ParBuffer[i].status='dead';
    }
    PEmitter1.LT=V;
}
function ChangeForce(ForceType,status)
{
   switch (ForceType){

       case 'Gra': PEmitter1.DoGravity=status;break;
       case 'Spr': PEmitter1.DoSpring=status;break;
       case 'Tor': PEmitter1.DoTornado=status;break;
       case 'Flo': PEmitter1.DoFlock=status;break;
   }
}
function ChangeSolver(name,status)
{
    for(i=0;i<Solvers.children.length;i++)
    {
        Solvers.children[i].checked=false;
    }
    Solvers.children[name].checked=status;
    SolverType=name;
}
function SetPhyStatus(value,status,Emitter)
{
    V=parseInt(value);
    if(PEmitter1.ParBuffer[V]){
        if(status){
            PEmitter1.ParBuffer[V].status='nonPhy';
        }else{
            PEmitter1.ParBuffer[V].status='active';
        }
    }
}