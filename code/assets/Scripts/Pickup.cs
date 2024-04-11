using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Pickup : MonoBehaviour {
    const float sinkInAmount = 0.1f; // How much to sink towards the katamari when being picked up
    const float shrinkAmount = 0.9f;

    public float radius;
    public string pickupName;
    public bool removeColliderOnPickup = false;
    GameObject particle;
    Collider myCollider;

    void Start()
    {
        particle = (GameObject)Resources.Load("Prefabs/Petal");
        myCollider = GetComponent<Collider>();
    }

    bool CanPickup()
    {
        return GameManager.manager.katamari.GetSize() > radius;
    }

    public void Update()
    {
        if (tag == "ConnectedPickup")
            return;

        myCollider.isTrigger = CanPickup();
    }

    void SinkIn()
    {
        Vector3 playerPos = transform.parent.position;
        Vector3 towardsCenter = (playerPos - transform.position).normalized * sinkInAmount;
        transform.position += towardsCenter;

        // Calculate towards center for collider
        towardsCenter =  transform.worldToLocalMatrix.MultiplyVector(towardsCenter);
        
        float shrinkScale = 1.0f - shrinkAmount;

        var sphere = myCollider as SphereCollider;
        if (sphere)
        {
            sphere.radius *= shrinkScale;
            sphere.center += towardsCenter;
        }

        var capsule = myCollider as CapsuleCollider;
        if(capsule)
        {
            capsule.radius *= shrinkScale;
            capsule.height *= shrinkScale;
            capsule.center += towardsCenter;
        }

        var box = myCollider as BoxCollider;
        if (box)
        {
            box.size *= shrinkScale;
            box.center += towardsCenter;
        }
    }

    public void OnTriggerEnter(Collider c)
    {
        if (tag == "ConnectedPickup")
            return;

        if (!CanPickup())
            return;

        var other = c.gameObject;

        // See if we hit something related to the player
        GameObject player;
        if (other.tag == "Player")
        {
            player = other;
        }
        else if (other.tag == "ConnectedPickup")
        {
            player = other.transform.parent.gameObject;
        }
        else
        {
            return;
        }

        // We hit the player

        myCollider.isTrigger = false;
        gameObject.layer = LayerMask.NameToLayer("Ignore Raycast");

        transform.SetParent(player.transform);

        SinkIn();

        if (removeColliderOnPickup)
        {
            myCollider.enabled = false;
        }

        // Remove rigidbody if we have one
        var rigidbody = GetComponent<Rigidbody>();
        if (rigidbody)
        {
            Destroy(rigidbody);
        }

        // Change Tag
        tag = "ConnectedPickup";

        player.GetComponent<Katamari>().OnPickup(this);

        // Spawn pickup particle
        for(int i = 0; i < 2; i++)
        {
            var p = GameObject.Instantiate(particle);
            p.transform.position = transform.position;
        }
    }
}
