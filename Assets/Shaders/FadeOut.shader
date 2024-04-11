// Upgrade NOTE: replaced 'mul(UNITY_MATRIX_MVP,*)' with 'UnityObjectToClipPos(*)'

Shader "Hidden/FadeOut"
{
	Properties
	{
		_MainTex("Texture", 2D) = "white" {}
		_Radius("Radius", Range(0, 99999)) = 0
	}
	SubShader
	{
		// No culling or depth
		Cull Off ZWrite Off ZTest Always

		Pass
		{
			CGPROGRAM
			#pragma vertex vert
			#pragma fragment frag
			
			#include "UnityCG.cginc"

			struct appdata
			{
				float4 vertex : POSITION;
				float2 uv : TEXCOORD0;
			};

			struct v2f
			{
				float2 uv : TEXCOORD0;
				float4 vertex : SV_POSITION;
				float2 screenPos : TEXCOORD1;
			};

			v2f vert (appdata v)
			{
				v2f o;
				o.uv = v.uv;
				o.vertex = UnityObjectToClipPos(v.vertex);
				o.screenPos = ComputeScreenPos(v.vertex) * _ScreenParams.xy;
				return o;
			}
			
			sampler2D _MainTex;
			float _Radius;

			fixed4 frag (v2f i) : SV_Target
			{
				fixed4 col = tex2D(_MainTex, i.uv);

				float2 diff = i.screenPos - ComputeScreenPos(float4(.5, .5, 1, 1)) * _ScreenParams.xy;
				float len = length(diff);
				if (len < _Radius)
				{
					if (len % 20 < 10)
						return fixed4(0.301, 0.274, 0.686, 1);
					else
						return fixed4(0.705, 0.694, 0.886, 1);
				}
				return col;
			}
			ENDCG
		}
	}
}
