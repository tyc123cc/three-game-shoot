precision mediump float;
precision mediump sampler2D;

// 声明一个纹理对象变量
uniform sampler2D tDiffuse;

uniform bool death;

uniform vec2 mapSize;
uniform vec2 mapOffsetSize;
uniform vec2 screenSize;

// 顶点片元化后有多少个片元就有多少个纹理坐标数据vUv
varying vec2 vUv;

varying vec3 mPosition;

void main(){
    //内置函数texture2D通过纹理坐标vUv获得贴图texture的像素值
    vec4 tColor=texture2D(tDiffuse,vUv);
    //计算RGB三个分量光能量之和，也就是亮度
    float luminance=.299*tColor.r+.587*tColor.g+.114*tColor.b;
    // 地图所占屏幕比例
    vec2 mapSizeScale=vec2(min(mapSize.x/screenSize.x,1.),min(mapSize.y/screenSize.y,1.));
    // 地图偏移量所占屏幕比例
    vec2 mapOffsetSizeScale=vec2(min(mapOffsetSize.x/screenSize.x,1.),min(mapOffsetSize.y/screenSize.y,1.));
    // 地图的边界（边界大小-1~1）
    float left=1.-(mapOffsetSizeScale.x+mapSizeScale.x)*2.;
    float right=1.-mapOffsetSizeScale.x*2.;
    float top=-1.+(mapOffsetSizeScale.y+mapSizeScale.y)*2.;
    float bottom=-1.+mapOffsetSizeScale.y*2.;
    //  float top=1.;
    // float bottom=-1;
    bool inMap=mPosition.x>left&&mPosition.x<right&&mPosition.y<top&&mPosition.y>bottom;
    if(death&&!inMap){
        // 死亡状态下将除地图以外的场景渲染为黑白
        gl_FragColor=vec4(vec3(luminance),tColor.a);
    }
    else{
        // 正常渲染
        gl_FragColor=tColor;
    }
    
}