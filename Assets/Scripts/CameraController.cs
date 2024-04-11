using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraController : MonoBehaviour {
    const float distanceIncrement = 0.1f; // What increment of size to increase distance from katamari

    public Transform target;
    public float angle; // Angle on the x/z plane
    public float planeDistance; // Distance on the x/z plane to the target
    public float yOffset;
    public float orbitSpeed;
    public bool expandWithKatamari = false;

    float startingPlaneDistance;
    float desiredPlaneDistance;

    float startingYOffset;
    float desiredYOffset;

    float startingSize;

    void Start () {
        startingSize = GameManager.manager.katamari.GetSize();
        startingPlaneDistance = planeDistance;
        startingYOffset = yOffset;
    }

    public void Orbit(float dir)
    {
        angle += dir * orbitSpeed;
    }
	
	void Update () {
        var katamariSizeInc = GameManager.manager.katamari.GetSize() - startingSize;

        desiredPlaneDistance = startingPlaneDistance + katamariSizeInc * 2.0f;
        desiredYOffset = startingYOffset + katamariSizeInc * 0.8f;

        planeDistance = Mathf.Lerp(planeDistance, desiredPlaneDistance, 0.2f);
        yOffset = Mathf.Lerp(yOffset, desiredYOffset, 0.2f);

        Vector3 offset = new Vector3(0, 0, 0);
        offset.x = Mathf.Cos(angle) * planeDistance;
        offset.z = Mathf.Sin(angle) * planeDistance;
        offset.y = yOffset;

        transform.position = target.position + offset;
        transform.LookAt(target);
	}
}
