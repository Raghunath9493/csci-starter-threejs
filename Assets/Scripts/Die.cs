using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Die : MonoBehaviour {
    public float minDeathTime;
    public float maxDeathTime;

    void Start () {
        Invoke("PleaseDie", Random.Range(minDeathTime, maxDeathTime));
	}

    void PleaseDie() {
        Destroy(gameObject);
    }
}
