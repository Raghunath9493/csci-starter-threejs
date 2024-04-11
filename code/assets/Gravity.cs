using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Gravity : MonoBehaviour {
    public float gravity;
    Rigidbody rigidBody;

	void Start () {
        rigidBody = GetComponent<Rigidbody>();	
	}

    void FixedUpdate () {
        rigidBody.AddForce(Vector3.down * gravity);
	}
}
