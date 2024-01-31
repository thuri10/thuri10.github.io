+++
title = 'Android frida basics'
date = 2024-01-18T17:37:39+03:00
draft = true
summary= "Frida dynamic instrumentation basics"
+++

## Challenge 0x1 : Frida setup, Hooking a method

```java
public void onClick(View view) {
    String obj = editText.getText().toString();
    if (TextUtils.isDigitsOnly(obj)) {
        MainActivity.this.check(i, Integer.parseInt(obj));
    } else {
        Toast.makeText(MainActivity.this.getApplicationContext(), "Enter a valid number !!", 1).show();
    }
}
});
}

int get_random() {
    return new Random().nextInt(100);
}

void check(int i, int i2) {
    if ((i * 2) + 4 == i2) {
        Toast.makeText(getApplicationContext(), "Yey you guessed it right", 1).show();
```

script solution

```javascript
if (Java.available) {
    Java.perform(function () {
        let main = Java.use("com.ad2001.frida0x1.MainActivity");
        main.check.overload("int", "int").implementation = function (a, b) {
            this.check(4, 12);
        };
    });
}
```

write more about method overloads

## Challenge 0x2 : Calling a static method

```java
   public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(C0536R.layout.activity_main);
        t1 = (TextView) findViewById(C0536R.id.textview);
    }

    public static void get_flag(int a) {
        if (a == 4919) {
            try {
                SecretKeySpec secretKeySpec = new SecretKeySpec("HILLBILLWILLBINN".getBytes(), "AES");
                Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
                IvParameterSpec iv = new IvParameterSpec(new byte[16]);
                cipher.init(2, secretKeySpec, iv);
                byte[] decryptedBytes = cipher.doFinal(Base64.decode("q7mBQegjhpfIAr0OgfLvH0t/D0Xi0ieG0vd+8ZVW+b4=", 0));
                String decryptedText = new String(decryptedBytes);
                t1.setText(decryptedText);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
```

```javascript
if (Java.available) {
    Java.perform(function () {
        let main = Java.use("com.ad2001.frida0x2.MainActivity");
        main.get_flag(4919);
    });
}
```

## Challenge 0x3 : Changing the value of a variable

```java
    public void onCreate(Bundle savedInstanceState) {
        ........code omitted ....

            public void onClick(View v) {
                if (Checker.code == 512) {
                    byte[] bArr = new byte[0];
                    Toast.makeText(MainActivity.this.getApplicationContext(), "YOU WON!!!", 1).show();
```

```java
public class Checker {
    static int code = 0;

    public static void increase() {
        code += 2;
    }
}
```

Solution Script

```javascript
if (Java.available) {
    Java.perform(function () {
        let main = Java.use("com.ad2001.frida0x3.Checker");
        main.code.value = 512;
    });
}
```

## Challenge 0x4 : Creating a class instance

```java
public class Check {
    public static String get_flag(int a) {
        if (a == 1337) {
            byte[] decoded = new byte["I]FKNtW@]JKPFA\\[NALJr".getBytes().length];
            for (int i = 0; i < "I]FKNtW@]JKPFA\\[NALJr".getBytes().length; i++) {
                decoded[i] = (byte) ("I]FKNtW@]JKPFA\\[NALJr".getBytes()[i] ^ 15);
            }
            return new String(decoded);
        }
        return "";
    }
}
```

Solution Script

```javascript
if (Java.available) {
    Java.perform(function () {
        let main = Java.use("com.ad2001.frida0x4.Check");

        let check_instance = main.$new(); // instatiate a new class
        let results_flag = check_instance.get_flag(1337);
        console.log("Flag: " + results_flag);
    });
}
```

## Challenge 0x5 : Invoking methods on an existing instance

Device crashes

## Challenge 0x6 : Invoking a method with an object argument

## Challenge 0x7 : Hooking the constructor

## Challenge 0x8 : Introduction to native hooking

## Challenge 0x9 : Changing the return value of a native function

## Challenge 0xA : Calling a native function

## Challenge 0xB : Patching instructions using X86Writer and ARM64Writer
