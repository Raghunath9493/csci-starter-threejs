using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Katamari : MonoBehaviour {
    const float pickupRewardRatio = 0.03f; // How much radius to reward for picking up an item of a certain radius?
    const float pickupInfluence = 0.03f; // How much of all the items radiuses on us do we also add to the size?
    const float pickupSpeedIncrease = 0.005f; // How much radius increases speed

    public float speed;
    public Transform shadow;
    public AudioClip collectSound;

    new Rigidbody rigidbody;
    SphereCollider sphereCollider;
    float startingRadius;

    Transform katamariBall;
    float totalPickupSize = 0;

    void Start () {
        rigidbody = GetComponent<Rigidbody>();
        sphereCollider = GetComponent<SphereCollider>();
        startingRadius = sphereCollider.radius;
        katamariBall = transform.Find("KatamariBall");
    }

    public float GetSize() {
        return GetComponent<SphereCollider>().radius + totalPickupSize;
    }

    public void Move(Vector3 dir) {
        rigidbody.AddTorque(dir * speed, ForceMode.Impulse);
    }

    public void OnPickup(Pickup pickup) {
        sphereCollider.radius += pickup.radius * pickupRewardRatio;
        katamariBall.localScale = Vector3.one * sphereCollider.radius / startingRadius;
        totalPickupSize += pickup.radius * pickupInfluence;
        speed += pickup.radius * pickupSpeedIncrease;

        Camera.main.GetComponent<AudioSource>().PlayOneShot(collectSound, 0.3f);
        GameManager.manager.OnPickup(pickup.pickupName);

        Debug.Log(GetSize());
    }

    void UpdateShadow() {
        int groundMask = LayerMask.GetMask("Default");
        RaycastHit hit;
        if (Physics.Raycast(transform.position, Vector3.down, out hit, 20, groundMask)) {
            shadow.position = hit.point;
            shadow.position += Vector3.up * 0.001f; // Move it slightly up. No Z Fighting here!
            shadow.LookAt(shadow.position + hit.normal);
        }
        else 
            shadow.position = new Vector3(-9999, -9999, -9999);
    }
	
	void Update () {
        UpdateShadow();
    }
}
