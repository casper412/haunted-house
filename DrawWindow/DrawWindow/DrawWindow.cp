/*
 *  DrawWindow.cp
 *  DrawWindow
 *
 *  Created by Matthew Hall on 12/7/13.
 *  Copyright (c) 2013 Matthew Hall. All rights reserved.
 *
 */

#include <iostream>
#include "DrawWindow.h"
#include "DrawWindowPriv.h"

#include <OpenGL/gl.h>		   // Open Graphics Library (OpenGL) header

#include "com_rhinocorps_simajin_gin_DrawWindow.h"

void DrawWindow::HelloWorld(const char * s)
{
	 DrawWindowPriv *theObj = new DrawWindowPriv;
	 theObj->HelloWorldPriv(s);
	 delete theObj;
};

void DrawWindowPriv::HelloWorldPriv(const char * s) 
{
	std::cout << s << std::endl;
};

JNIEXPORT void JNICALL Java_com_rhinocorps_simajin_gin_DrawWindow_drawSomething
(JNIEnv *, jobject) {
  glBegin(GL_TRIANGLES);
  glColor3f(0.0f,0.0f,1.0f);
  glVertex3f( 0.0f, 1.0f, 0.0f);
  glColor3f(0.0f,1.0f,0.0f);
  glVertex3f(-1.0f,-1.0f, 0.0f);
  glColor3f(1.0f,0.0f,0.0f);
  glVertex3f( 1.0f,-1.0f, 0.0f);
	glEnd();
}
