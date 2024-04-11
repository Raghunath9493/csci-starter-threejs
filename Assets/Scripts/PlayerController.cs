using UnityEngine;

public class PlayerController : MonoBehaviour {
    Katamari katamari;

	void Start () {
        katamari = GetComponent<Katamari>();	
	}

    float PickBestInput(float a, float b)
    {
        if (Mathf.Abs(a) > Mathf.Abs(b))
            return a;
        else
            return b;
    }
	
	void FixedUpdate () {
        if (GameManager.manager.state != GameState.Playing)
            return;

        var cam = Camera.main;

        // Since the camera is tilted either upwards or downwards, the forward direction has a y component
        // We don't want this as it pushes the katamari down in the ground
        // cam.transform.right is okay as we don't tilt the camera. Hackish but effective
        Vector3 forwardDir = transform.position - cam.transform.position;
        forwardDir.y = 0;
        forwardDir.Normalize();

        float LefthandX = Input.GetAxis("LefthandX");
        float LefthandY = Input.GetAxis("LefthandY");

        float RighthandX = Input.GetAxis("RighthandX");
        float RighthandY = Input.GetAxis("RighthandY");


        float XLeftstick = Input.GetAxis("XLeftstick");
        float YLeftstick = Input.GetAxis("YLeftstick");

        float XRightstick = Input.GetAxis("XRightstick");
        float YRightstick = Input.GetAxis("YRightstick");

        float LeftX = PickBestInput(LefthandX, XLeftstick);
        float LeftY = PickBestInput(LefthandY, YLeftstick);

        float RightX = PickBestInput(RighthandX, XRightstick);
        float RightY = PickBestInput(RighthandY, YRightstick);

        float YDiff = LeftY - RightY;

        if (YDiff > -1.5f && YDiff < 1.5f)
        {
            float Xavg = (LeftX + RightX) / 2.0f;
            float Yavg = (LeftY + RightY) / 2.0f;
            
            Vector3 right = cam.transform.right * -Yavg;
            Vector3 forward = forwardDir * -Xavg;

            // Vector3 right = forwardDir * -Yavg;
            // Vector3 forward = cam.transform.right * Xavg;
            Vector3 dir = right + forward;
            dir.Normalize();
            katamari.Move(dir);
        }
        else {
            Camera.main.GetComponent<CameraController>().Orbit(YDiff);
        }
	}
}
