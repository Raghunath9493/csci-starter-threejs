using UnityEngine;
using UnityEngine.UI;

public class MenuSystem : MonoBehaviour
{
    public Text first;
    public Text second;
    public Image pin;
    Color originalTextColor;

    AudioClip choiceSound;
    int choice = 0;
    int prevDir;

    void Start()
    {
        originalTextColor = first.color;
        Select(first, 0);
    }

    void Select(Text t, int choice)
    {
        this.choice = choice;

        first.color = originalTextColor;
        second.color = originalTextColor;

        t.color = pin.color;
        pin.transform.position = t.transform.Find("PinLocation").position;
        if (!choiceSound)
        {
            choiceSound = (AudioClip)Resources.Load("Sounds/MenuChoice");
        }
        else
        {
            Camera.main.GetComponent<AudioSource>().PlayOneShot(choiceSound);
        }
    }

    void Update()
    {
        
        float realDir = Input.GetAxisRaw("Vertical");
        Debug.Log(realDir);
        int dir = 0;
        if (realDir > 0.05f)
            dir = 1;
        else if (realDir < -0.05f)
            dir = -1;
        if (prevDir != dir)
        {
            if (dir == 1)
            {
                Select(first, 0);
            }
            if (dir == -1)
            {
                Select(second, 1);
            }
        }
        prevDir = dir;

        if (Input.GetKey(KeyCode.A) || Input.GetKey(KeyCode.KeypadEnter) || Input.GetKey(KeyCode.Space) || Input.GetKey(KeyCode.Return) || Input.GetKey("joystick button 0"))
        {
            SendMessage("MenuChoice", choice);
        }
    }
}
