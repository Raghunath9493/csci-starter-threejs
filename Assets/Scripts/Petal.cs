using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Petal : MonoBehaviour {
    public float speed;
    public float rotateSpeed;

    public Sprite[] sprites;

    float rotateDir;
    float dirAngle;
    SpriteRenderer sprite;

    Transform spriteChild;

    void Start () {
        bool rotateRight = Random.Range(0, 1) <= 0.5f;
        if (rotateRight)
            rotateDir = 1;
        else
            rotateDir = -1;


        dirAngle = Random.Range(0, Mathf.PI);
        
        spriteChild = transform.GetChild(0);
        sprite = spriteChild.GetComponent<SpriteRenderer>();
        Sprite s = sprites[Random.Range(0, sprites.Length)];
        sprite.sprite = s;
    }

	void Update () {
        transform.LookAt(Camera.main.transform, Camera.main.transform.up);
        Vector3 dir = transform.right * Mathf.Cos(dirAngle) + transform.up * Mathf.Sin(dirAngle);

        transform.position += dir * speed * Time.deltaTime;
        spriteChild.Rotate(Vector3.forward, rotateDir * rotateSpeed * Time.deltaTime);

        float alpha = sprite.color.a;
        alpha = Mathf.Max(0, alpha - Time.deltaTime * 0.4f);
        sprite.color = new Color(sprite.color.r, sprite.color.g, sprite.color.b, alpha);
	}
}
