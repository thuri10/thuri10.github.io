+++
title = 'Android Hacking workshop'
date = 2024-01-18T17:29:32+03:00
draft = true
summary =" Android hacking workshop by google writeup"
+++

Android app Hacking application is an application used by google team on teaching basics of android hacking. It can be downloaded from the following url: https://google.com/. The application consists of eigth different challenges containing different challenges and different concepts.
For analysis the first point of analysis is the `AndroidManifest.xml` file which is the entry point of an application.

## Challenge 01

> The goal of this challenge is to find the correct flag.

Looking at the source code we get the right answer

```java
public class Challenge01Activity extends AppCompatActivity {
    final String TAG;

    public Challenge01Activity() {
        this.TAG = "Challenge01Activity";
    }

    @Override  // androidx.fragment.app.FragmentActivity
    protected void onCreate(Bundle bundle0) {
        super.onCreate(bundle0);
        this.setContentView(0x7F0B001C);  // layout:activity_challenge01
        ((Button)this.findViewById(0x7F080063)).setOnClickListener(new View.OnClickListener() {  // id:btn_challenge_01_flag
            @Override  // android.view.View$OnClickListener
            public void onClick(View view0) {
                Log.d("Challenge01Activity", "buttonFlag clicked!");
                String s = ((EditText)Challenge01Activity.this.findViewById(0x7F08007E)).getText().toString();  // id:challenge01_flag_entry
                if(Challenge01Activity.this.validateChallenge01Flag(s)) {
                    Log.i("Challenge01Activity", "Challenge 01 Flag: VALID :-)");
                    Toast.makeText(Challenge01Activity.this.getApplicationContext(), "Challenge 01 Flag : VALID", 1).show();
                    MySharedPreferences.setChallengeStatus(Challenge01Activity.this.getApplicationContext(), 1, true);
                    Challenge01Activity.this.finish();
                    return;
                }

                Toast.makeText(Challenge01Activity.this.getApplicationContext(), "Challenge 01 Flag : TRY AGAIN :-(", 1).show();
                Log.i("Challenge01Activity", "Challenge 01 Flag : TRY AGAIN :-(");
            }
        });
    }

    private boolean validateChallenge01Flag(String s) {
        return new String("th3F1rst0neI5E4sy").equals(s);
    }
}
```

submitting `th3F1rst0neI5E4sy` string as our flag we get a valid message to confirm we have successfully solved the challenge.

## Challenge 02

```java
public class Challenge02Activity extends AppCompatActivity {
    final String TAG;
    private static final byte[] resource;
    private static final byte[] xorKey;

    static {
        Challenge02Activity.resource = new byte[]{0x72, 101, 0x73, 0x6F, 0x75, 0x72, 99, 101, 0x73, 46, 100, 97, 0x74, 97};
        Challenge02Activity.xorKey = new byte[]{0x60, 6, 30};
    }

    public Challenge02Activity() {
        this.TAG = "Challenge02Activity";
    }

    @Override  // androidx.fragment.app.FragmentActivity
    protected void onCreate(Bundle bundle0) {
        super.onCreate(bundle0);
        this.setContentView(0x7F0B001D);  // layout:activity_challenge02
        ((Button)this.findViewById(0x7F080065)).setOnClickListener(new View.OnClickListener() {  // id:btn_challenge_02_flag
            @Override  // android.view.View$OnClickListener
            public void onClick(View view0) {
                Log.d("Challenge02Activity", "buttonFlag clicked!");
                String s = ((EditText)Challenge02Activity.this.findViewById(0x7F080080)).getText().toString();  // id:challenge02_flag_entry
                if(Challenge02Activity.this.validateChallenge02Flag(s)) {
                    Log.i("Challenge02Activity", "Challenge 02 Flag: VALID :-)");
                    Toast.makeText(Challenge02Activity.this.getApplicationContext(), "Challenge 02 Flag: VALID", 1).show();
                    MySharedPreferences.setChallengeStatus(Challenge02Activity.this.getApplicationContext(), 2, true);
                    Challenge02Activity.this.finish();
                    return;
                }

                Toast.makeText(Challenge02Activity.this.getApplicationContext(), "Challenge 02 Flag : TRY AGAIN :-(", 1).show();
                Log.i("Challenge02Activity", "Challenge 02 Flag: TRY AGAIN :-(");
            }
        });
    }

    private boolean validateChallenge02Flag(String s) {
        AssetManager assetManager0 = this.getApplicationContext().getAssets();
        try {
            Charset charset0 = StandardCharsets.UTF_8;
            String s1 = new String(Crypto.xor(Crypto.decodeBase64(new BufferedReader(new InputStreamReader(assetManager0.open("resources.data"), "UTF-8")).readLine()), Challenge02Activity.xorKey), charset0);
            Log.d("Challenge02Activity", "userFlag = " + s + "  --  " + s1);
            return Objects.equals(s, s1);
        }
        catch(IOException iOException0) {
            iOException0.printStackTrace();
            return false;
        }
    }
}
```

the challenge does not some encoding and decoding as encrption. to solve the challenge we write a java code to solve the problem
Due to insecure logging implementations, we run the application and the `userFlag` is printed in the logcat output. running `adb logcat | grep userFlag`

```bash
Challenge02Activity: userFlag =   --  x0r15N0Ts0sTRoN6
Challenge02Activity: userFlag = x0r15N0Ts0sTRoN6  --  x0r15N0Ts0sTRoN6
```

The correct flag for the second challenge is `x0r15N0Ts0sTRoN6`.

## Challenge 03

```java
public class Challenge03Activity extends AppCompatActivity {
    final String TAG;

    public Challenge03Activity() {
        this.TAG = "Challenge03Activity";
    }

    @Override  // androidx.fragment.app.FragmentActivity
    protected void onCreate(Bundle bundle0) {
        super.onCreate(bundle0);
        this.setContentView(0x7F0B001E);  // layout:activity_challenge03
        if(MySharedPreferences.getLaunches(this.getApplicationContext()) == 0 || MySharedPreferences.getLaunches(this.getApplicationContext()) % 3 != 0) {
            this.finish();
        }

        ((Button)this.findViewById(0x7F080067)).setOnClickListener(new View.OnClickListener() {  // id:btn_challenge_03_flag
            @Override  // android.view.View$OnClickListener
            public void onClick(View view0) {
                Log.d("Challenge03Activity", "buttonFlag clicked!");
                String s = ((EditText)Challenge03Activity.this.findViewById(0x7F080082)).getText().toString();  // id:challenge03_flag_entry
                if(Challenge03Activity.this.validateChallenge03Flag(s)) {
                    Log.i("Challenge03Activity", "Challenge 03 Flag: VALID :-)");
                    Toast.makeText(Challenge03Activity.this.getApplicationContext(), "Challenge 03 Flag : VALID", 1).show();
                    MySharedPreferences.setChallengeStatus(Challenge03Activity.this.getApplicationContext(), 3, true);
                    Challenge03Activity.this.finish();
                    return;
                }

                Toast.makeText(Challenge03Activity.this.getApplicationContext(), "Challenge 03 Flag : TRY AGAIN :-(", 1).show();
                Log.i("Challenge03Activity", "Challenge 03 Flag : TRY AGAIN :-(");
            }
        });
    }

    private boolean validateChallenge03Flag(String s) {
        return ("N0tS0W3llH1dd3n".equals(s)) && MySharedPreferences.getLaunches(this.getApplicationContext()) % 3 == 0;
    }
}
```

onlicking the application it makes a toast `Find another way to lauch this challenge`
Looking at the manifest file, the application can be launched by another application externally because the exported flag is set to `true`.

```xml
    <activity
      android:exported="true"
      android:name="aah.challenges.Challenge03Activity"
      android:parentActivityName="aah.challenges.MainActivity"/>
```

Looking at the challenge three manifest file, we have also a receiver

```xml
    <receiver
      android:exported="true"
      android:name="aah.challenges.Receivers.Challenge03Receiver">
      <intent-filter>
        <action android:name="android.provider.Telephony.SECRET_CODE"/>
        <data
          android:host="600613"
          android:scheme="android_secret_code"/>
      </intent-filter>
    </receiver>
```

## Challenge 04

This challenge involves a native module `flagvalidation` as shown in the code below

```java

public class Challenge04Activity extends AppCompatActivity {
    final String TAG;

    static {
        System.loadLibrary("flagvalidation");
    }

    public Challenge04Activity() {
        this.TAG = "Challenge04Activity";
    }

    @Override  // androidx.fragment.app.FragmentActivity
    protected void onCreate(Bundle bundle0) {
        super.onCreate(bundle0);
        this.setContentView(0x7F0B001F);  // layout:activity_challenge04
        ((Button)this.findViewById(0x7F080069)).setOnClickListener(new View.OnClickListener() {  // id:btn_challenge_04_flag
            @Override  // android.view.View$OnClickListener
            public void onClick(View view0) {
                Log.d("Challenge04Activity", "buttonFlag clicked!");
                if(ValidateNativeFlags.isValidFlag(((EditText)Challenge04Activity.this.findViewById(0x7F080084)).getText().toString())) {  // id:challenge04_flag_entry
                    Log.i("Challenge04Activity", "Challenge 04 Flag: VALID :-)");
                    Toast.makeText(Challenge04Activity.this.getApplicationContext(), "Challenge 04 Flag : VALID", 1).show();
                    MySharedPreferences.setChallengeStatus(Challenge04Activity.this.getApplicationContext(), 4, true);
                    Challenge04Activity.this.finish();
                    return;
                }

                Toast.makeText(Challenge04Activity.this.getApplicationContext(), "Challenge 04 Flag : TRY AGAIN :-(", 1).show();
                Log.i("Challenge04Activity", "Challenge 04 Flag : TRY AGAIN :-(");
            }
        });
    }
}
```

open the file in `ghidra` and look for the `isValidFlag` function.

Look at the decompiled code we are able to get the right flag for challenge04

```c

void Java_Utils_ValidateNativeFlags_isValidFlag(int *param_1,undefined4 param_2,undefined4 param_3)

{
  bool bVar1;
  char *__s;
  size_t sVar2;
  int userFlagResult;
  uint uVar3;
  undefined uStack_121;
  char userInput [260];
  int stack_canary;

  stack_canary = __stack_chk_guard;
  __s = (char *)(**(code **)(*param_1 + 0x2a4))(param_1,param_3,&uStack_121);
  memAllocate(userInput,0x100);
  sVar2 = strlen(__s);
  if (sVar2 < 0x100) {
    if (*__s != '\0') {
      sVar2 = strlen(__s);
      uVar3 = 0;
      do {
        userInput[uVar3] = __s[uVar3] + '\x03';
        uVar3 = uVar3 + 1;
      } while (uVar3 < sVar2);
    }
    userFlagResult = memcmp(userInput,"WKLVLVKWHQDWLYHIODJ",0x14);
    bVar1 = userFlagResult == 0;
  }
  else {
    bVar1 = false;
  }
  if (__stack_chk_guard != stack_canary) {
                    /* WARNING: Subroutine does not return */
    __stack_chk_fail(bVar1);
  }
  return;
}

```

Doing the substitution operation we get the correct flag.The correct flag is `THISISHTENATIVEFLAG`.

## Challenge 05

Understand how the receiver is working
In challenge 05 we have an activity and receiver. Looking at the activity it is validating using a native library but it is never loaded

```java
public class Challenge05Activity extends AppCompatActivity {
    final String TAG = "Challenge05Activity";

    /* JADX INFO: Access modifiers changed from: protected */
    @Override // androidx.fragment.app.FragmentActivity, androidx.activity.ComponentActivity, androidx.core.app.ComponentActivity, android.app.Activity
    public void onCreate(Bundle bundle) {
        super.onCreate(bundle);
        setContentView(C0016R.layout.activity_challenge05);
        ((Button) findViewById(C0016R.id.btn_challenge_05_flag)).setOnClickListener(new View.OnClickListener() { // from class: aah.challenges.Challenge05Activity.1
            @Override // android.view.View.OnClickListener
            public void onClick(View view) {
                Log.d("Challenge05Activity", "buttonFlag clicked!");
                if (ValidateNativeFlags.isValidFlagAgain(((EditText) Challenge05Activity.this.findViewById(C0016R.id.challenge05_flag_entry)).getText().toString())) {
                    Log.i("Challenge05Activity", "Challenge 05 Flag: VALID :-)");
                    Toast.makeText(Challenge05Activity.this.getApplicationContext(), "Challenge 05 Flag : VALID", 1).show();
                    MySharedPreferences.setChallengeStatus(Challenge05Activity.this.getApplicationContext(), 5, true);
                    Challenge05Activity.this.finish();
                    return;
                }
                Toast.makeText(Challenge05Activity.this.getApplicationContext(), "Challenge 05 Flag : TRY AGAIN :-(", 1).show();
                Log.i("Challenge05Activity", "Challenge 05 Flag : TRY AGAIN :-(");
            }
        });
    }
}
```

The `ValidateNativeFlags.isValidFlagAgain ` is not referenced in the activity, therefore means we need to look more closely at the `receiver`.

Looking at the Android Manifest file, the receiver can be called by an external application.

```xml
<receiver android:name="aah.challenges.Receivers.Challenge05Receiver" android:exported="true">
    <intent-filter>
        <action android:name="aah.intent.LOAD_LIB"/>
    </intent-filter>
</receiver>
```

```java

public class Challenge05Receiver extends BroadcastReceiver {
    private final String EXTRA_CHALLENGE05;
    private final String TAG;

    public Challenge05Receiver() {
        this.TAG = "Challenge05Receiver";
        this.EXTRA_CHALLENGE05 = "CHALLENGE05_ALOHAMORA";
    }

    @Override  // android.content.BroadcastReceiver
    public void onReceive(Context context0, Intent intent0) {
        Log.d("Challenge05Receiver", "onReceive");
        if((intent0.hasExtra("CHALLENGE05_ALOHAMORA")) && (intent0.getBooleanExtra("CHALLENGE05_ALOHAMORA", false))) {
            System.loadLibrary("lib");
            Log.d("Challenge05Receiver", "Challenge05 lib loaded");
        }
    }
}
```

check the manifest file for any challenge

```xml
    <receiver
      android:exported="true"
      android:name="aah.challenges.Receivers.Challenge05Receiver">
      <intent-filter>
        <action android:name="aah.intent.LOAD_LIB"/>
      </intent-filter>
    </receiver>

```

Looking at the `isValid` decompiled code were are able to get the correct flag.

```c

undefined4 verify_flag(byte *userFlag)

{
  size_t flagLen;
  uint uVar1;
  int iVar2;
  uint uVar3;
  int flagLength;
  undefined4 uVar4;
  uint uVar5;

  if (userFlag == (byte *)0x0) {
    fwrite("[-] input mus\'t be NULL\n",0x18,1,stderr);
    uVar4 = 5;
  }
  else {
    flagLen = strlen((char *)userFlag);
    if (flagLen == 9) {
      puts("[+] serial length ok");
      uVar1 = *userFlag - 0x41;
      if (uVar1 < 0x1a) {
        uVar1 = userFlag[1] - 0x41;
      }
      if (uVar1 < 0x1a) {
        uVar1 = userFlag[2] - 0x41;
      }
      if (uVar1 < 0x1a) {
        uVar1 = userFlag[3] - 0x41;
      }
      if ((uVar1 < 0x1a) && (userFlag[4] == 0x2d)) {
        uVar1 = userFlag[5] - 0x30;
        if (uVar1 < 10) {
          uVar1 = userFlag[6] - 0x30;
        }
        if (uVar1 < 10) {
          uVar1 = userFlag[7] - 0x30;
          if (uVar1 < 10) {
            uVar1 = userFlag[8] - 0x30;
          }
          if (uVar1 < 10) {
            puts("[+] format serial verified !");
            uVar1 = 0;
            uVar5 = (uint)(byte)(userFlag[8] ^
                                *userFlag ^ userFlag[1] ^ userFlag[2] ^ userFlag[3] ^ userFlag[5] ^
                                userFlag[6] ^ userFlag[7]);
            iVar2 = 0;
            do {
              if (iVar2 == 4) {
                flagLength = 4;
              }
              else {
                uVar3 = *(uint *)(userFlag + iVar2);
                uVar1 = uVar1 ^ (uVar3 << 0x18 | (uVar3 >> 8 & 0xff) << 0x10 |
                                 (uVar3 >> 0x10 & 0xff) << 8 | uVar3 >> 0x18);
                flagLength = iVar2 + 4;
              }
              iVar2 = flagLength + 1;
            } while (flagLength < 8);
            if (uVar5 != 0x10 || uVar1 != 0x687e7076) {
              fwrite("[-] wrong serial\n",0x11,1,stderr);
              fprintf(stderr,"    -> [checksum byte]  expected : %02X       | got : %02X\n",0x10,
                      uVar5);
              fprintf(stderr,"    -> [checksum int]   expected : %08X | got : %08X\n",0x687e7076,
                      uVar1);
              return 1;
            }
            return 0;
          }
        }
      }
      fwrite("[-] wrong serial format\n",0x18,1,stderr);
      uVar4 = 2;
    }
    else {
      fwrite("[-] wrong serial length\n",0x18,1,stderr);
      uVar4 = 3;
    }
  }
  return uVar4;
}
```

## Challenge 06

## Challenge 07

The Challenge 07 implements Dynamic Code loading and deletes the loaded Decrypted payload

```java
    public boolean validateChallenge07lag(String str) {
        Log.d("Challenge07Activity", "validateChallenge07Flag");
        decryptAndCopyPayloadFromAssets(getApplicationContext());
        String str2 = getApplicationContext().getFilesDir() + "/payload.apk";
        Log.d("Challenge07Activity", "DexClassLoader: " + str2);
        Log.d("Challenge07Activity", "DexClassLoader: aah.inception.payload.FlagValidation");
        Log.d("Challenge07Activity", "DexClassLoader: validateFlag");
        DexClassLoader dexClassLoader = new DexClassLoader(str2, null, null, getClass().getClassLoader());
        boolean z = false;
        try {
            Class loadClass = dexClassLoader.loadClass("aah.inception.payload.FlagValidation");
            z = ((Boolean) loadClass.getMethod("validateFlag", String.class).invoke(loadClass.newInstance(), str)).booleanValue();
            Log.d("Challenge07Activity", "validateFlag = " + z);
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e2) {
            e2.printStackTrace();
        } catch (IllegalArgumentException e3) {
            e3.printStackTrace();
        } catch (InstantiationException e4) {
            e4.printStackTrace();
        } catch (NoSuchMethodException e5) {
            e5.printStackTrace();
        } catch (InvocationTargetException e6) {
            e6.printStackTrace();
        }
        deletePayloadFromSdcard(getApplicationContext());
        return z;
    }
}
```

we write a frida hook for not deleting the loaded payload and pull out the payload for further analysis.

## Challenge 08

Vulnerable webview

```java
    public void onCreate(Bundle bundle) {
        super.onCreate(bundle);
        setContentView(C0016R.layout.activity_challenge08);
        WebView webView = (WebView) findViewById(C0016R.id.challenge_08_urlWebView);
        this.webView = webView;
        webView.setWebViewClient(new WebViewClient());
        this.webView.getSettings().setJavaScriptEnabled(true);
        this.webView.getSettings().setAppCacheEnabled(false);
        this.webView.getSettings().setCacheMode(2);
        this.urlText = (EditText) findViewById(C0016R.id.challenge_08_urlText);
        EditText editText = (EditText) findViewById(C0016R.id.challenge_08_flagText);
        this.flagText = editText;
        editText.setText(this.challengeFlag);
        this.loadUrlButton = (Button) findViewById(C0016R.id.btn_challenge_08_load_url);
        this.webView.addJavascriptInterface(new JsObject(), "JS_OBJECT");
        this.loadUrlButton.setOnClickListener(new View.OnClickListener() { // from class: aah.challenges.Challenge08Activity$$ExternalSyntheticLambda0
            @Override // android.view.View.OnClickListener
            public final void onClick(View view) {
                Challenge08Activity.this.m23lambda$onCreate$0$aahchallengesChallenge08Activity(view);
            }
        });
        ((Button) findViewById(C0016R.id.btn_challenge_08_flag)).setOnClickListener(new View.OnClickListener() { // from class: aah.challenges.Challenge08Activity.1
            @Override // android.view.View.OnClickListener
            public void onClick(View view) {
                Log.d("Challenge08Activity", "buttonFlag clicked!");
                if (Challenge08Activity.this.challengeFlag.equals(((EditText) Challenge08Activity.this.findViewById(C0016R.id.challenge08_flag_entry)).getText().toString())) {
                    Log.i("Challenge08Activity", "Challenge 08 Flag: VALID :-)");
                    Toast.makeText(Challenge08Activity.this.getApplicationContext(), "Challenge 08 Flag : VALID", 1).show();
                    MySharedPreferences.setChallengeStatus(Challenge08Activity.this.getApplicationContext(), 8, true);
                    Challenge08Activity.this.finish();
                    return;
                }
                Toast.makeText(Challenge08Activity.this.getApplicationContext(), "Challenge 08 Flag : TRY AGAIN :-(", 1).show();
                Log.i("Challenge08Activity", "Challenge 08 Flag : TRY AGAIN :-(");
            }
        });
    }

    public /* synthetic */ void m23lambda$onCreate$0$aahchallengesChallenge08Activity(View view) {
        this.webView.loadUrl(this.urlText.getEditableText().toString());
    }
}
```
