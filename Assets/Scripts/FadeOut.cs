using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class FadeOut : MonoBehaviour {
    public Material material;
    public bool fadingIn;
    float lerp = 0;

    float radius;
    float maxRadius;

    void Start()
    {
        maxRadius = (Screen.width / 4.0f) * Mathf.Sqrt(2.0f);
        if (fadingIn)
        {
            lerp = 1;
        }
    }

    void Update()
    {
        int dir = 1;
        if (fadingIn)
        {
            dir = -1;
        }
        lerp += dir * 0.7f * Time.deltaTime;
        lerp = Mathf.Clamp01(lerp);

        radius = Mathf.Lerp(0, maxRadius, lerp);
    }

    void OnRenderImage(RenderTexture source, RenderTexture destination)
    {
        material.SetFloat("_Radius", radius);
        Graphics.Blit(source, destination, material);
    }
}
